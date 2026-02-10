const DEBUG_CHANNELS = {
    INTERNAL_DEBUG_CAMERA: "__INTERNAL__DEBUG_CAMERA", //for camera position
    INTERNAL_DEBUG_SCENE: "__INTERNAL__DEBUG_SCENE" //for scene data right now is just a json fetch from backend


}

const INFO_CHANNELS = {
    CAMERA_CONTROL_INFO: "CAMERA_CONTROL_INFO",

    SCENE_NAME_INFO: "SCENE_NAME_INFO",
    MODEL_LIST_INFO: "MODEL_LIST_INFO",
    LIGHT_LIST_INFO: "LIGHT_LIST_INFO"
}

const CONTROL_CHANNELS = {
    CAMERA_CONTROL_UPDATE: "CAMERA_CONTROL_UPDATE"
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
