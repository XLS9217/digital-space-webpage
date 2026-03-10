const DEBUG_CHANNELS = {

    /* For scene data debug
     * Inside digital-space-toolkit package,
     * Publish by:
     * - ./DigitalScene/DigitalScene.jsx
     * Subscribe by:
     * - ./DebugPanel/DebugPanel.jsx
     */
    INTERNAL_DEBUG_SCENE: "__INTERNAL__DEBUG_SCENE" //for scene data right now is just a json fetch from backend
}

const INFO_CHANNELS = {
    
    /* For camera control info
     * Inside digital-space-toolkit package,
     * Publish by:
     * - ./DigitalSpaceControl.jsx
     * Subscribe by:
     * - ./DebugPanel/PanelContent/CameraControlBlock.jsx
     */
    CAMERA_CONTROL_INFO: "CAMERA_CONTROL_INFO",
}

//this channel is for scene control from debug panel
const CONTROL_CHANNELS = {
    
    /* For camera control update
     * Inside digital-space-toolkit package,
     * Publish by:
     * - ./DigitalScene/DigitalScene.jsx
     * Subscribe by:
     * - ./DigitalSpaceControl.jsx
     */
    CAMERA_CONTROL_UPDATE: "CAMERA_CONTROL_UPDATE",
    
    /* For camera control settings update
     * Inside digital-space-toolkit package,
     * Publish by:
     * - ./DebugPanel/PanelContent/CameraControlBlock.jsx
     * Subscribe by:
     * - ./DigitalSpaceControl.jsx
     */
    CAMERA_CONTROL_SETTINGS_UPDATE: "CAMERA_CONTROL_SETTINGS_UPDATE", 
    
    /* For object update by name
     * Inside digital-space-toolkit package,
     * Publish by:
     * - ./DebugPanel/PanelContent/LightList.jsx
     * - ./DebugPanel/PanelContent/ModelList.jsx
     * Subscribe by:
     * - ./DebugPanel/DebugTunnel.jsx
     */
    OBJECT_UPDATE_BY_NAME: "OBJECT_UPDATE_BY_NAME",

    /* For model list update (add/remove)
     * Inside digital-space-toolkit package,
     * Publish by:
     * - TBD
     * Subscribe by:
     * - ./DigitalScene/DigitalScene.jsx
     */
    MODEL_LIST_UPDATE: "MODEL_LIST_UPDATE",

    /* For light list update (add/remove)
     * Inside digital-space-toolkit package,
     * Publish by:
     * - ./DebugPanel/PanelContent/LightList.jsx
     * Subscribe by:
     * - ./DigitalScene/DigitalScene.jsx
     */
    LIGHT_LIST_UPDATE: "LIGHT_LIST_UPDATE"
}

class EventChannelHub {
    constructor() {
        // Store channels and their subscribers
        this.channels = new Map();
    }

    subscribe(channelName, callback)
    {
        //1. if channel does not exist, create it
        if (!this.channels.has(channelName)) {
            this.channels.set(channelName, []);
        }
        //2. check if callback already subscribed
        const callbacks = this.channels.get(channelName);
        if (callbacks.includes(callback)) {
            return false;
        }
        //3. add callback to channel and return true
        callbacks.push(callback);
        return true;
    }

    unsubscribe(channelName, callback)
    {
        //1. if channel does not exist, return false
        if (!this.channels.has(channelName)) {
            return false;
        }
        //2. remove all occurrences of callback
        const callbacks = this.channels.get(channelName);
        const filtered = callbacks.filter(cb => cb !== callback);
        this.channels.set(channelName, filtered);

        //3. if channel is now empty, remove it
        if (filtered.length === 0) {
            this.channels.delete(channelName);
        }

        return true;
    }

    publish(channelName, data) {
        //1. if channel does not exist, create it
        if (!this.channels.has(channelName)) {
            this.channels.set(channelName, []);
        }
        //2. call all callbacks in loop with data and return true
        this.channels.get(channelName).forEach(callBack => callBack(data));
        return true;
    }

    log_channels() {
        //1. log all channels and their subscribers
        console.log(this.channels);
    }
}
export const eventChannelHub = new EventChannelHub();
export { DEBUG_CHANNELS, INFO_CHANNELS, CONTROL_CHANNELS };
