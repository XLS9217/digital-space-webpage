class WebRegistry {
    constructor() {
        this.upload = null;
        this.download = null;
    }

    registerUpload(fn) {
        if (this.upload !== null) {
            throw new Error('WebRegistry.registerUpload: upload function is already registered.');
        }
        if (typeof fn !== 'function') {
            throw new Error('WebRegistry.registerUpload: argument must be a function.');
        }
        this.upload = fn;
        return this;
    }

    registerDownload(fn) {
        if (this.download !== null) {
            throw new Error('WebRegistry.registerDownload: download function is already registered.');
        }
        if (typeof fn !== 'function') {
            throw new Error('WebRegistry.registerDownload: argument must be a function.');
        }
        this.download = fn;
        return this;
    }
}

const webRegistry = new WebRegistry();
export default webRegistry;