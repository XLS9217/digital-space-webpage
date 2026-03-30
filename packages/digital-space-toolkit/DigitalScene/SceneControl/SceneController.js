import { eventChannelHub, CONTROL_CHANNELS, INFO_CHANNELS } from '../../EventChannelHub.js';
import { GROUP_TYPE } from '../../SceneTypeEnum.js';
import LevelsController from './LevelsController.js';


export const STATE_TYPE = {
    BIG_VIEW: "big-view",
    LEVEL_VIEW: "level-view"
}

// Main controller for scene groups - top-level orchestration
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
        // Use == instead of === because GROUP_TYPE.LEVEL is a String object, not a primitive
        if (group.type == GROUP_TYPE.LEVEL) {
            controller = new LevelsController(group);
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

        // LevelsController will publish SCENE_STATE_CHANGE with activeUuids
        return controller.investigateLayer(layerIndex);
    }
}

export default SceneController;
