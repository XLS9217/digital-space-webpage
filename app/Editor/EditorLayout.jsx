import { useState } from 'react'
import EditorTopbar from './EditorTopbar'
import EditorStage from './EditorStage'
import { getSceneByName, upsertScene } from '../API/gateway.js'
import './Editor.css'

export default function EditorLayout() {
  const [sceneName, setSceneName] = useState('beijing_white')
  const [sceneNameInput, setSceneNameInput] = useState(sceneName)

  const defaultScenePayload = {
    general: {
      background: {
        color: '#000000',
        enabled: true
      }
    },
    control: {
      type: 'orbit',
      position: {
        x: 0,
        y: 5,
        z: 10
      },
      target: {
        x: 0,
        y: 0,
        z: 0
      },
      zoom: {
        min: 1,
        max: 100
      },
      angle: {
        min: 0,
        max: Math.PI
      },
      enablePan: true,
      enableRotate: true,
      enableZoom: true
    },
    lights: [],
    models: [],
    groups: []
  }

  const handleGo = () => {
    const trimmed = sceneNameInput.trim()
    if (trimmed) {
      setSceneName(trimmed)
    }
  }

  const handleNew = async () => {
    const trimmed = sceneNameInput.trim()
    if (!trimmed) {
      return
    }

    try {
      try {
        await getSceneByName(trimmed)
        console.warn(`Scene "${trimmed}" already exists. Aborting NEW to avoid overwrite.`)
        return
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error
        }
      }
      await upsertScene(trimmed, defaultScenePayload)
      setSceneName(trimmed)
    } catch (error) {
      console.error('Failed to create default scene:', error)
    }
  }

  return (
    <div className="editor-layout">
      <EditorTopbar
        sceneNameInput={sceneNameInput}
        onSceneNameChange={setSceneNameInput}
        onGo={handleGo}
        onNew={handleNew}
      />
      <EditorStage sceneName={sceneName} />
    </div>
  )
}