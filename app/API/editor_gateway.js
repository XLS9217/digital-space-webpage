import request from './request.js'

const DEFAULT_SCENE_PAYLOAD = {
  general: {
    background: {
      color: '#ffffff',
      enabled: true
    }
  },
  control: {
    type: 'orbit',
    position: { x: 0, y: 5, z: 15 },
    target: { x: 0, y: 0, z: 0 },
    zoom: { min: 1, max: 200 },
    angle: { min: 0.1, max: 3.1 },
    enablePan: true,
    enableRotate: true,
    enableZoom: true
  },
  lights: [
    {
      name: 'Ambient',
      type: 'AmbientLight',
      intensity: 0.6,
      color: '#ffffff'
    },
    {
      name: 'Directional',
      type: 'DirectionalLight',
      intensity: 1.2,
      position: { x: 10, y: 10, z: 10 },
      target: { x: 0, y: 0, z: 0 },
      color: '#ffffff'
    }
  ],
  models: [],
  groups: []
}

/**
 * Create a new scene with backend defaults
 * @param {string} name - The scene name
 * @returns {Promise<Object>}
 */
export async function createScene(name) {
  try {
    const response = await request.post(`/editor/scene/${name}`, DEFAULT_SCENE_PAYLOAD)
    return response.data
  } catch (error) {
    console.error('Error creating editor scene:', error)
    throw error
  }
}

/**
 * List editor scenes
 * @returns {Promise<string[]|Object[]>}
 */
export async function listEditorScenes() {
  try {
    const response = await request.get('/editor/scenes')
    return response.data?.scenes || []
  } catch (error) {
    console.error('Error listing editor scenes:', error)
    throw error
  }
}

/**
 * Delete editor scene by name
 * @param {string} name - The scene name
 * @returns {Promise<Object>}
 */
export async function deleteEditorScene(name) {
  try {
    const response = await request.delete(`/editor/scene/${name}`)
    return response.data
  } catch (error) {
    console.error('Error deleting editor scene:', error)
    throw error
  }
}