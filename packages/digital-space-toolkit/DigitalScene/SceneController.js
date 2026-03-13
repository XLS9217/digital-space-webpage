import { eventChannelHub, CONTROL_CHANNELS } from '../EventChannelHub';
import { GROUP_TYPE } from '../SceneTypeEnum';

/**
 * Controller for a single level group
 * Manages layer lifting state and animations
 */
class _LevelsController {

    constructor(group) {
        this.group = group;
        this.liftedLayers = new Set(); // Track which layer indices are lifted
        this.liftTarget = group.metadata?.liftTarget || { x: 0, y: 50, z: 0 };
    }

    /**
     * Investigate a layer - lifts layers above, brings down layers at/below
     * If the layer has a saved control snapshot, animates camera to that view
     */
    investigateLayer(layerIndex) {
        const floors = this.group.groups || [];

        if (layerIndex < 0 || layerIndex >= floors.length) {
            console.warn(`Invalid layer index ${layerIndex} for group "${this.group.name}"`);
            return false;
        }

        const targetLayer = floors[layerIndex];
        const savedControl = targetLayer.metadata?.control;

        // Layers above the clicked one (lower index = higher floor) - should be lifted
        const layersAbove = floors.slice(0, layerIndex);
        // Layers at or below the clicked one - should be at ground level
        const layersAtOrBelow = floors.slice(layerIndex);

        // Find layers above that need to be lifted
        const layersToLift = layersAbove
            .map((layer, index) => ({ layer, index }))
            .filter(({ index }) => !this.liftedLayers.has(index));

        // Find layers at or below that need to be brought down
        const layersToBringDown = layersAtOrBelow
            .map((layer, index) => ({ layer, index: index + layerIndex }))
            .filter(({ index }) => this.liftedLayers.has(index));

        // Lift layers above using liftTarget, hide after animation
        const namesToLift = layersToLift.flatMap(({ layer }) => layer.names || []);
        namesToLift.forEach(name => {
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                name,
                property: 'position',
                value: this.liftTarget,
                relative: true,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
                        name,
                        property: 'visible',
                        value: false
                    });
                    console.log(`Lifted object: ${name}`);
                }
            });
        });

        // Bring down layers at or below, show before animation
        const namesToBringDown = layersToBringDown.flatMap(({ layer }) => layer.names || []);
        namesToBringDown.forEach(name => {
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
                name,
                property: 'visible',
                value: true
            });
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                name,
                property: 'position',
                value: { x: -this.liftTarget.x, y: -this.liftTarget.y, z: -this.liftTarget.z },
                relative: true,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    console.log(`Brought down object: ${name}`);
                }
            });
        });

        // Update lifted layers state
        layersToLift.forEach(({ index }) => this.liftedLayers.add(index));
        layersToBringDown.forEach(({ index }) => this.liftedLayers.delete(index));

        // If layer has saved control snapshot, animate camera to that view
        if (savedControl && savedControl.position) {
            // Disable all controls during animation
            eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
                enablePan: false,
                enableRotate: false,
                enableZoom: false
            });

            // Animate camera position and target
            eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_ANIMATION, {
                position: savedControl.position,
                target: savedControl.target || { x: 0, y: 0, z: 0 },
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    // Apply saved control settings
                    const settings = {};

                    // Set min/max zoom if available
                    if (savedControl.zoom) {
                        settings.minDistance = savedControl.zoom.min;
                        settings.maxDistance = savedControl.zoom.max;
                    }

                    // Set min/max angle if available
                    if (savedControl.angle) {
                        settings.minPolarAngle = savedControl.angle.min;
                        settings.maxPolarAngle = savedControl.angle.max;
                    }

                    // Set enable flags from saved control
                    settings.enablePan = savedControl.enablePan !== undefined ? savedControl.enablePan : true;
                    settings.enableRotate = savedControl.enableRotate !== undefined ? savedControl.enableRotate : true;
                    settings.enableZoom = savedControl.enableZoom !== undefined ? savedControl.enableZoom : true;

                    eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, settings);

                    console.log(`Camera animated to saved view for layer "${targetLayer.name}"`);
                }
            });
        }

        console.log(`Investigated layer "${targetLayer.name}" (index ${layerIndex}) in group "${this.group.name}"`);
        return true;
    }

    /**
     * Get all object names in a specific layer
     */
    getLayerObjects(layerIndex) {
        const floors = this.group.groups || [];
        if (layerIndex < 0 || layerIndex >= floors.length) {
            return [];
        }
        return floors[layerIndex].names || [];
    }

    /**
     * Check if a layer is currently lifted
     */
    isLayerLifted(layerIndex) {
        return this.liftedLayers.has(layerIndex);
    }

    /**
     * Reset all lifted layers (bring everything back to ground level)
     */
    resetAllLayers() {
        const floors = this.group.groups || [];

        floors.forEach((layer, index) => {
            if (this.liftedLayers.has(index)) {
                const names = layer.names || [];
                names.forEach(name => {
                    eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
                        name,
                        property: 'visible',
                        value: true
                    });
                    eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                        name,
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

/**
 * SceneController - Main controller for scene groups
 * Simple API exposure, delegates to specific group controllers
 *
 * Usage:
 *   const controllerRef = useRef();
 *   <DigitalScene sceneName="myScene" controllerRef={controllerRef} />
 *
 *   controllerRef.current.investigateLayer('levelGroupName', layerIndex);
 */
class SceneController {

    constructor() {
        this.groups = [];
        this.controllerMap = new Map(); // Map<groupName, Controller>
    }

    /**
     * Load groups data from scene and initialize controllers
     */
    loadGroups(groups) {
        this.groups = groups || [];
        this.controllerMap.clear();

        // Initialize controllers for top-level groups
        for (const group of groups) {
            let controller = null;

            if (group.type == GROUP_TYPE.LEVEL) {
                controller = new _LevelsController(group);
            }
            // Future: other group types

            if (controller) {
                this.controllerMap.set(group.name, controller);
            }
        }
    }

    /**
     * Update a specific group's data (e.g., when layer metadata changes)
     */
    updateGroup(groupName, updatedGroup) {
        // Find and update the group in the groups array
        const groupIndex = this.groups.findIndex(g => g.name === groupName);
        if (groupIndex !== -1) {
            this.groups[groupIndex] = updatedGroup;
        }

        // Update the controller's reference to the group
        const controller = this.controllerMap.get(groupName);
        if (controller && controller.group) {
            controller.group = updatedGroup;
            // Preserve liftTarget if it exists in metadata
            if (updatedGroup.metadata?.liftTarget) {
                controller.liftTarget = updatedGroup.metadata.liftTarget;
            }
        }
    }

    /**
     * Investigate a layer - delegates to the group's controller
     */
    investigateLayer(groupName, layerIndex) {
        const controller = this.controllerMap.get(groupName);
        if (!controller || !controller.investigateLayer) {
            console.warn(`Cannot investigate layer for group "${groupName}"`);
            return false;
        }
        return controller.investigateLayer(layerIndex);
    }
}

export default SceneController;