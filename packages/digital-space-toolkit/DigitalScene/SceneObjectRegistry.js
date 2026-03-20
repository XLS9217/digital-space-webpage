// Singleton registry mapping Three.js uuid to scene data + Object3D.
// No React state — just a lookup table used by ControlTunnel, debug panel, and groups.

class SceneObjectRegistry {
    constructor() {
        this._map = new Map(); // uuid → { type, data, threeObject }
    }

    register(uuid, type, data, threeObject) {
        this._map.set(uuid, { type, data, threeObject });
    }

    unregister(uuid) {
        this._map.delete(uuid);
    }

    get(uuid) {
        return this._map.get(uuid);
    }

    getThreeObject(uuid) {
        return this._map.get(uuid)?.threeObject;
    }

    getData(uuid) {
        return this._map.get(uuid)?.data;
    }

    // Update the data object for a uuid (e.g. after rename)
    updateData(uuid, data) {
        const entry = this._map.get(uuid);
        if (entry) entry.data = data;
    }

    // Iterate all entries, optionally filtered by type ('model' | 'light')
    *all(type) {
        for (const [uuid, entry] of this._map) {
            if (!type || entry.type === type) {
                yield { uuid, ...entry };
            }
        }
    }

    // Find first entry matching a name (for migration / compat)
    findByName(name) {
        for (const [uuid, entry] of this._map) {
            if (entry.data?.name === name) {
                return { uuid, ...entry };
            }
        }
        return undefined;
    }

    clear() {
        this._map.clear();
    }
}

const sceneObjectRegistry = new SceneObjectRegistry();
export default sceneObjectRegistry;
