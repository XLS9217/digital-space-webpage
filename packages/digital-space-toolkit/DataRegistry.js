class DataRegistry {
    constructor() {
        this.upsert = null;
        this.download = null;
        this.load = null;
        this.getFileUrl = null;
    }

    registerLoad(fn) {
        if (this.load !== null) {
            throw new Error('DataRegistry.registerLoad: load function is already registered.');
        }
        if (typeof fn !== 'function') {
            throw new Error('DataRegistry.registerLoad: argument must be a function.');
        }
        this.load = fn;
        return this;
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

    registerGetFileUrl(fn) {
        if (this.getFileUrl !== null) {
            throw new Error('DataRegistry.registerGetFileUrl: getFileUrl function is already registered.');
        }
        if (typeof fn !== 'function') {
            throw new Error('DataRegistry.registerGetFileUrl: argument must be a function.');
        }
        this.getFileUrl = fn;
        return this;
    }

    unregisterLoad() {
        this.load = null;
        return this;
    }

    unregisterUpsert() {
        this.upsert = null;
        return this;
    }

    unregisterDownload() {
        this.download = null;
        return this;
    }

    unregisterGetFileUrl() {
        this.getFileUrl = null;
        return this;
    }
}

const dataRegistry = new DataRegistry();
export default dataRegistry;