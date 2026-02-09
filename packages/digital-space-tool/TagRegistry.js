class TagRegistry {
    constructor() {
        this.registry = new Map();
    }

    /*
     prefix is processed in Frame Model, for the word separated by _ at a front
     component must accept a name prop
     options are for Html component in drei
     */

    register(prefix, component, options = {}) {
        const { distanceFactor = undefined } = options;
        const hasNamePropType = component?.propTypes && Object.prototype.hasOwnProperty.call(component.propTypes, 'name');
        const hasNameDefault = component?.defaultProps && Object.prototype.hasOwnProperty.call(component.defaultProps, 'name');

        if (typeof component !== 'function') {
            throw new Error('TagRegistry.register: component must be a function.');
        }

        if (component.length < 1 && !hasNamePropType && !hasNameDefault) {
            throw new Error('TagRegistry.register: component must accept a `name` prop.');
        }

        this.registry.set(prefix, {
            component,
            distanceFactor
        });
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
