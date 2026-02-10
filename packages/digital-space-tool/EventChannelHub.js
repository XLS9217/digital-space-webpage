const DEBUG_CHANNELS = {
    INTERNAL_DEBUG_CAMERA: "__INTERNAL__DEBUG_CAMERA", //for camera position
    INTERNAL_DEBUG_SCENE: "__INTERNAL__DEBUG_SCENE" //for scene data right now is just a json fetch from backend
}

const INFO_CHANNELS = {
    CONTROL_INFO: "CONTROL_INFO",
}

class EventChannelHub {
    constructor() {
        // Store channels and their subscribers
        this.channels = new Map();
        Object.values(DEBUG_CHANNELS).forEach((channelName) => {
            this.channels.set(channelName, []);
        });
    }
    
    add_channel(channelName) {
        //1. if channel already exists, return false
        if (this.channels.has(channelName)) return false;
        //2. if channel does not exist, add and return true
        this.channels.set(channelName, []);
        return true;
    }

    remove_channel(channelName) {
        //1. if channel does not exist, return false
        if (!this.channels.has(channelName)) return false;
        //2. if channel exists, remove and return true
        this.channels.delete(channelName);
        return true;
    }

    subscribe(channelName, callback)
    {
        //1. if channel does not exist, return false
        if (!this.channels.has(channelName)) {
            return false;
        }
        //2. if channel exists, check if callback already subscribed
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
        //2. if channel exists, remove all occurrences of callback and return true
        const callbacks = this.channels.get(channelName);
        const filtered = callbacks.filter(cb => cb !== callback);
        this.channels.set(channelName, filtered);
        return true;
    }

    publish(channelName, data) { 
        //1. if channel does not exist, return false
        if (!this.channels.has(channelName)) return false;
        //2. if channel exists, call all callbacks in loop with data and return true
        this.channels.get(channelName).forEach(callBack => callBack(data));
        return true;
    }

    log_channels() { 
        //1. log all channels and their subscribers
        console.log(this.channels);
    }
}
export const eventChannelHub = new EventChannelHub();
export { DEBUG_CHANNELS, INFO_CHANNELS };
