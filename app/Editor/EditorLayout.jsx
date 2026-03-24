import { useState } from 'react'
import EditorTopbar from './EditorTopbar'
import EditorStage from './EditorStage'
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

  return (
    <div className="editor-layout">
      <EditorTopbar
        sceneNameInput={sceneNameInput}
        onSceneNameChange={setSceneNameInput}
        onGo={handleGo}
      />
      <EditorStage sceneName={sceneName} />
    </div>
  )
}