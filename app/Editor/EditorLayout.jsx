import { useState } from 'react'
import EditorTopbar from './EditorTopbar'
import EditorStage from './EditorStage'
import { createScene } from '../API/editor_gateway.js'
import './Editor.css'

export default function EditorLayout() {
  const [sceneName, setSceneName] = useState('beijing_white')
  const [sceneNameInput, setSceneNameInput] = useState(sceneName)


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
      await createScene(trimmed)
      setSceneName(trimmed)
    } catch (error) {
      console.error('Failed to create editor scene:', error)
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