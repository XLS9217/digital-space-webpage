import request from "./request.js";

/**
 * Get scene by name
 * @param {string} name - The scene name
 * @returns {Promise<Object>}
 */
export async function getSceneByName(name) {
    try {
        const response = await request.get(`/scene/${name}`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error fetching scene by name:', error);
        throw error;
    }
}

/**
 * Download scene as zip with models
 * @param {string} name - The scene name
 * @returns {Promise<Blob>}
 */
export async function downloadSceneZip(name) {
    try {
        const response = await request.get(`/scene-zip/${name}`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error downloading scene zip:', error);
        throw error;
    }
}

/**
 * Upsert scene config
 * @param {string} name - The scene name
 * @param {Object} sceneJson - The scene config (control, models, lights - no urls)
 * @returns {Promise<Object>}
 */
export async function upsertScene(name, sceneJson) {
    try {
        const response = await request.post(`/scene-upsert/${name}`, sceneJson);
        return response.data;
    } catch (error) {
        console.error('Error upserting scene:', error);
        throw error;
    }
}
