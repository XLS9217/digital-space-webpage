
/* Store keys for debug information
 * Used to store live data that can be accessed across components
 */
const DEBUG_STORE = {
    /* Current camera control state
     * Inside digital-space-toolkit package,
     * Stored by:
     * - ./DebugPanel/PanelContent/CameraControlBlock.jsx
     * Retrieved by:
     * - ./DebugPanel/PanelContent/Groups/LevelGroup.jsx (for layer snapshots)
     */
    CURRENT_CONTROL: "current_control"
}

/* InfoStoreHub - Redis-style key-value store for live debug data
 * Provides a centralized store for current state information
 * that needs to be accessed across multiple components
 */
class InfoStoreHub {
    constructor() {
        this.store_map = new Map();
    }

    /* Store data in the hub
     * @param {string} channel - The key to store data under
     * @param {any} data - The data to store
     */
    store(channel, data) {
        this.store_map.set(channel, data);
    }

    /* Retrieve data from the hub
     * @param {string} channel - The key to retrieve data from
     * @returns {any} The stored data, or undefined if not found
     */
    get(channel) {
        return this.store_map.get(channel);
    }
}

export const infoStoreHub = new InfoStoreHub();
export { DEBUG_STORE };