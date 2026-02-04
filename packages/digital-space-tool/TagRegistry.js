class TagRegistry {
    constructor() {
        this.registry = new Map();
    }

    register(prefix, component) {
        this.registry.set(prefix, component);
        return this;
    }

    unregister(prefix) {
        this.registry.delete(prefix);
        return this;
    }

    get(prefix) {
        return this.registry.get(prefix);
    }

    has(prefix) {
        return this.registry.has(prefix);
    }

    clear() {
        this.registry.clear();
    }
}

const tagRegistry = new TagRegistry();
export default tagRegistry;
