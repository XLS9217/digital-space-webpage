import request from "./request.js";

/**
 * Get scene by name
 * @param {string} name - The scene name
 * @returns {Promise<Object>}
 */
export async function getSceneByName(name) {
    try {
        const response = await request.get(`/scene/${name}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching scene by name:', error);
        throw error;
    }
}
