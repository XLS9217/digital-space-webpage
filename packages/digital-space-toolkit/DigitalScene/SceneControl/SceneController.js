import { eventChannelHub, CONTROL_CHANNELS, INFO_CHANNELS } from '../../EventChannelHub.js';
import { GROUP_TYPE } from '../../SceneTypeEnum.js';
import sceneObjectRegistry from '../SceneObjectRegistry.js';


export const STATE_TYPE = {
    BIG_VIEW: "big-view",
    LEVEL_VIEW: "level-view"
}

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
class _LevelsController {

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

        // If layer has saved control snapshot, animate camera
        if (savedControl && savedControl.position) {
            eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
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

// Main controller for scene groups
class SceneController {

    constructor() {
        this.groups = [];
        this.controllerMap = new Map();

        // State management
        this.currentStateType = STATE_TYPE.BIG_VIEW;
        this.bigViewCameraState = null;
    }

    // Capture big view state when scene loads
    captureBigViewState(cameraState) {
        if (!this.bigViewCameraState && cameraState) {
            this.bigViewCameraState = {
                position: { ...cameraState.position },
                target: { ...cameraState.target },
                // Capture all control settings
                zoom: cameraState.zoom ? { ...cameraState.zoom } : null,
                angle: cameraState.angle ? { ...cameraState.angle } : null,
                enablePan: cameraState.enablePan,
                enableRotate: cameraState.enableRotate,
                enableZoom: cameraState.enableZoom
            };
        }
    }

    // Get current state type
    getCurrentStateType() {
        return this.currentStateType;
    }

    // Check if can go back
    canGoBack() {
        return this.currentStateType === STATE_TYPE.LEVEL_VIEW;
    }

    // Go back to Big View state
    goBack() {
        if (this.currentStateType === STATE_TYPE.BIG_VIEW) {
            return false;
        }

        if (!this.bigViewCameraState) {
            console.warn('No Big View state captured');
            return false;
        }

        // Reset all layers to original positions
        for (const controller of this.controllerMap.values()) {
            if (controller.resetAllLayers) {
                controller.resetAllLayers();
            }
        }

        // Disable controls during animation (same as investigateLayer)
        eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
            enablePan: false,
            enableRotate: false,
            enableZoom: false
        });

        // Animate camera back to big view position
        eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_ANIMATION, {
            position: this.bigViewCameraState.position,
            target: this.bigViewCameraState.target,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                // Restore all control settings (same pattern as investigateLayer)
                const settings = {};
                if (this.bigViewCameraState.zoom) {
                    settings.minDistance = this.bigViewCameraState.zoom.min;
                    settings.maxDistance = this.bigViewCameraState.zoom.max;
                }
                if (this.bigViewCameraState.angle) {
                    settings.minPolarAngle = this.bigViewCameraState.angle.min;
                    settings.maxPolarAngle = this.bigViewCameraState.angle.max;
                }
                settings.enablePan = this.bigViewCameraState.enablePan !== undefined ? this.bigViewCameraState.enablePan : true;
                settings.enableRotate = this.bigViewCameraState.enableRotate !== undefined ? this.bigViewCameraState.enableRotate : true;
                settings.enableZoom = this.bigViewCameraState.enableZoom !== undefined ? this.bigViewCameraState.enableZoom : true;
                eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, settings);
            }
        });

        // Transition back to Big View state
        this.currentStateType = STATE_TYPE.BIG_VIEW;

        // Notify listeners about state change
        eventChannelHub.publish(INFO_CHANNELS.SCENE_STATE_CHANGE, {
            stateType: this.currentStateType
        });

        return true;
    }

    loadGroups(groups) {
        this.groups = groups || [];
        this.controllerMap.clear();
        for (const group of groups) {
            this._createController(group);
        }
    }

    _createController(group) {
        let controller = null;
        if (group.type == GROUP_TYPE.LEVEL) {
            controller = new _LevelsController(group);
        }
        if (controller) {
            this.controllerMap.set(group.name, controller);
        }
        return controller;
    }

    addGroup(group) {
        if (this.controllerMap.has(group.name)) {
            console.warn(`Group "${group.name}" already exists`);
            return false;
        }
        this.groups.push(group);
        this._createController(group);
        return true;
    }

    removeGroup(groupName) {
        const groupIndex = this.groups.findIndex(g => g.name === groupName);
        if (groupIndex !== -1) {
            this.groups.splice(groupIndex, 1);
        }
        this.controllerMap.delete(groupName);
        return true;
    }

    renameGroup(oldName, newName) {
        const controller = this.controllerMap.get(oldName);
        if (!controller) {
            console.warn(`Cannot rename group "${oldName}" - not found`);
            return false;
        }
        if (oldName !== newName && this.controllerMap.has(newName)) {
            console.warn(`Cannot rename to "${newName}" - name already exists`);
            return false;
        }

        const groupIndex = this.groups.findIndex(g => g.name === oldName);
        if (groupIndex !== -1) {
            this.groups[groupIndex].name = newName;
        }
        if (controller.group) {
            controller.group.name = newName;
        }
        if (oldName !== newName) {
            this.controllerMap.delete(oldName);
            this.controllerMap.set(newName, controller);
        }
        return true;
    }

    updateGroup(groupName, updatedGroup) {
        const controller = this.controllerMap.get(groupName);
        if (!controller) {
            console.warn(`Cannot update group "${groupName}" - not found`);
            return false;
        }

        const groupIndex = this.groups.findIndex(g => g.name === groupName);
        if (groupIndex !== -1) {
            this.groups[groupIndex] = updatedGroup;
        }
        if (controller.group) {
            controller.group = updatedGroup;
            if (updatedGroup.metadata?.liftTarget) {
                controller.liftTarget = updatedGroup.metadata.liftTarget;
            }
        }
        return true;
    }

    investigateLayer(groupName, layerIndex) {
        const controller = this.controllerMap.get(groupName);
        if (!controller || !controller.investigateLayer) {
            console.warn(`Cannot investigate layer for group "${groupName}"`);
            return false;
        }

        // Transition to Level View state
        this.currentStateType = STATE_TYPE.LEVEL_VIEW;

        // Notify listeners about state change
        eventChannelHub.publish(INFO_CHANNELS.SCENE_STATE_CHANGE, {
            stateType: this.currentStateType
        });

        return controller.investigateLayer(layerIndex);
    }
}

export default SceneController;
