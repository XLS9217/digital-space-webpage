class DataRegistry {
    constructor() {
        this.upsert = null;
        this.download = null;
    }

    registerUpsert(fn) {
        if (this.upsert !== null) {
            throw new Error('DataRegistry.registerUpload: upload function is already registered.');
        }
        if (typeof fn !== 'function') {
            throw new Error('DataRegistry.registerUpload: argument must be a function.');
        }
        this.upsert = fn;
        return this;
    }

    registerDownload(fn) {
        if (this.download !== null) {
            throw new Error('DataRegistry.registerDownload: download function is already registered.');
        }
        if (typeof fn !== 'function') {
            throw new Error('DataRegistry.registerDownload: argument must be a function.');
        }
        this.download = fn;
        return this;
    }
}

const dataRegistry = new DataRegistry();
export default dataRegistry;