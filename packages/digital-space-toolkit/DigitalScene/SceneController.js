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
     */
    investigateLayer(layerIndex) {
        const floors = this.group.groups || [];

        if (layerIndex < 0 || layerIndex >= floors.length) {
            console.warn(`Invalid layer index ${layerIndex} for group "${this.group.name}"`);
            return false;
        }

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
            // console.log(`Starting lift animation for: ${name}`);
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                name,
                property: 'position',
                value: this.liftTarget,
                relative: true,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    // console.log(`Lift animation complete, hiding: ${name}`);
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
            // console.log(`Showing before bring-down: ${name}`);
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
                name,
                property: 'visible',
                value: true
            });
            // console.log(`Starting bring-down animation for: ${name}`);
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

        console.log(`Investigated layer ${layerIndex} in group "${this.group.name}"`);
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