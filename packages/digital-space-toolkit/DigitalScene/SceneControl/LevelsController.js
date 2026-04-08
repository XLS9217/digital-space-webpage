import { eventChannelHub, CONTROL_CHANNELS, INFO_CHANNELS } from '../../EventChannelHub';
import sceneObjectRegistry from '../SceneObjectRegistry';
import { MODEL_TYPE } from '../../SceneTypeEnum';

// Resolve uuids for a layer — uses uuids[] if present, falls back to names[] via registry
function resolveLayerUuids(layer) {
    if (layer.uuids && layer.uuids.length > 0) return layer.uuids;
    if (layer.names && layer.names.length > 0) {
        return layer.names.map(name => {
            const entry = sceneObjectRegistry.findByName(name);
            return entry?.uuid;
        }).filter(Boolean);
    }
    return [];
}

// Controller for a single level group.
// Layers reference objects by uuid via SceneObjectRegistry.
class LevelsController {

    constructor(group) {
        this.group = group;
        this.liftedLayers = new Set();
        this.liftTarget = group.metadata?.liftTarget || { x: 0, y: 50, z: 0 };
    }

    // Investigate a layer — lifts layers above, brings down layers at/below
    investigateLayer(layerIndex) {
        const floors = this.group.groups || [];

        if (layerIndex < 0 || layerIndex >= floors.length) {
            console.warn(`Invalid layer index ${layerIndex} for group "${this.group.name}"`);
            return false;
        }

        const targetLayer = floors[layerIndex];
        const savedControl = targetLayer.metadata?.control;

        const layersAbove = floors.slice(0, layerIndex);
        const layersAtOrBelow = floors.slice(layerIndex);

        const layersToLift = layersAbove
            .map((layer, index) => ({ layer, index }))
            .filter(({ index }) => !this.liftedLayers.has(index));

        const layersToBringDown = layersAtOrBelow
            .map((layer, index) => ({ layer, index: index + layerIndex }))
            .filter(({ index }) => this.liftedLayers.has(index));

        // Lift layers above, hide after animation
        const uuidsToLift = layersToLift.flatMap(({ layer }) => resolveLayerUuids(layer));
        uuidsToLift.forEach(uuid => {
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                uuid,
                property: 'position',
                value: this.liftTarget,
                relative: true,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, {
                        uuid,
                        property: 'visible',
                        value: false
                    });
                }
            });
        });

        // Bring down layers at or below, show before animation
        const uuidsToBringDown = layersToBringDown.flatMap(({ layer }) => resolveLayerUuids(layer));
        uuidsToBringDown.forEach(uuid => {
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, {
                uuid,
                property: 'visible',
                value: true
            });
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                uuid,
                property: 'position',
                value: { x: -this.liftTarget.x, y: -this.liftTarget.y, z: -this.liftTarget.z },
                relative: true,
                duration: 1,
                ease: "power2.out"
            });
        });

        // Update lifted layers state
        layersToLift.forEach(({ index }) => this.liftedLayers.add(index));
        layersToBringDown.forEach(({ index }) => this.liftedLayers.delete(index));

        // Get active layer uuids
        const activeUuids = resolveLayerUuids(targetLayer);

        // Loop through all FRAME models and show/hide based on active layer
        for (const { uuid, data } of sceneObjectRegistry.all('model')) {
            if (data?.type === MODEL_TYPE.FRAME) {
                const isInActiveLayer = activeUuids.includes(uuid);
                eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, {
                    uuid,
                    property: 'visible',
                    value: isInActiveLayer
                });
            }
        }

        // Publish state change for debug panel
        eventChannelHub.publish(INFO_CHANNELS.SCENE_STATE_CHANGE, {
            stateType: 'level-view',
            groupName: this.group.name,
            layerIndex,
            activeUuids
        });

        // If layer has saved control snapshot, animate camera
        if (savedControl && savedControl.position) {
            // Remove all constraints so the lerp can travel freely
            eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
                minDistance: 0,
                maxDistance: Infinity,
                minPolarAngle: 0,
                maxPolarAngle: Math.PI,
                enablePan: false,
                enableRotate: false,
                enableZoom: false
            });

            eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_ANIMATION, {
                position: savedControl.position,
                target: savedControl.target || { x: 0, y: 0, z: 0 },
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    // Apply the layer's constraints after the lerp finishes
                    const settings = {};
                    if (savedControl.zoom) {
                        settings.minDistance = savedControl.zoom.min;
                        settings.maxDistance = savedControl.zoom.max;
                    }
                    if (savedControl.angle) {
                        settings.minPolarAngle = savedControl.angle.min;
                        settings.maxPolarAngle = savedControl.angle.max;
                    }
                    settings.enablePan = savedControl.enablePan !== undefined ? savedControl.enablePan : true;
                    settings.enableRotate = savedControl.enableRotate !== undefined ? savedControl.enableRotate : true;
                    settings.enableZoom = savedControl.enableZoom !== undefined ? savedControl.enableZoom : true;
                    eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, settings);
                }
            });
        }

        return true;
    }

    getLayerObjects(layerIndex) {
        const floors = this.group.groups || [];
        if (layerIndex < 0 || layerIndex >= floors.length) return [];
        return resolveLayerUuids(floors[layerIndex]);
    }

    isLayerLifted(layerIndex) {
        return this.liftedLayers.has(layerIndex);
    }

    // Hide frame models that belong to this group's layers (orphans stay visible)
    hideFrameModels() {
        const floors = this.group.groups || [];
        const layerUuids = new Set(floors.flatMap(layer => resolveLayerUuids(layer)));

        for (const { uuid, data } of sceneObjectRegistry.all('model')) {
            if (data?.type === MODEL_TYPE.FRAME && layerUuids.has(uuid)) {
                eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, {
                    uuid,
                    property: 'visible',
                    value: false
                });
            }
        }
    }

    // Reset all layers to their original positions
    resetAllLayers() {
        const floors = this.group.groups || [];

        floors.forEach((layer, index) => {
            if (this.liftedLayers.has(index)) {
                const uuids = resolveLayerUuids(layer);
                uuids.forEach(uuid => {
                    eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, {
                        uuid,
                        property: 'visible',
                        value: true
                    });
                    eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                        uuid,
                        property: 'position',
                        value: { x: -this.liftTarget.x, y: -this.liftTarget.y, z: -this.liftTarget.z },
                        relative: true,
                        duration: 1,
                        ease: "power2.out"
                    });
                });
            }
        });

        this.liftedLayers.clear();
    }
}

export default LevelsController;