import { useEffect, useState } from 'react'
import EditorTopbar from './EditorTopbar'
import EditorStage from './EditorStage'
import SceneMenu from './SceneMenu/SceneMenu'
import { dataRegistry } from 'digital-space-toolkit'
import { getSceneByName, downloadSceneZip, upsertScene, getFileUrl } from '../API/gateway.js'
import { createScene } from '../API/editor_gateway.js'
import './Editor.css'

export default function EditorLayout() {
  const [sceneName, setSceneName] = useState('beijing_white')
  const [sceneNameInput, setSceneNameInput] = useState(sceneName)
  const [showSceneMenu, setShowSceneMenu] = useState(false)

  useEffect(() => {
    if (!dataRegistry.load) {
      dataRegistry.registerLoad(getSceneByName)
    }
    if (!dataRegistry.upsert) {
      dataRegistry.registerUpsert(upsertScene)
    }
    if (!dataRegistry.download) {
      dataRegistry.registerDownload(downloadSceneZip)
    }
    if (!dataRegistry.getFileUrl) {
      dataRegistry.registerGetFileUrl(getFileUrl)
    }
  }, [])


  const handleGo = () => {
    const trimmed = sceneNameInput.trim()
    if (trimmed) {
      setSceneName(trimmed)
      setShowSceneMenu(false)
    }
  }

  const handleSceneSelect = (name) => {
    setSceneName(name)
    setSceneNameInput(name)
    setShowSceneMenu(false)
  }

  const handleTitleClick = () => {
    setShowSceneMenu((prev) => !prev)
  }

  const handleNew = async () => {
    const trimmed = sceneNameInput.trim()
    if (!trimmed) {
      return
    }

    try {
      await createScene(trimmed)
      setSceneName(trimmed)
      setShowSceneMenu(false)
    } catch (error) {
      console.error('Failed to create editor scene:', error)
    }
  }

  return (
    <div className="editor-layout">
      <EditorTopbar onTitleClick={handleTitleClick} />
      {showSceneMenu ? (
        <SceneMenu
          onSceneSelect={handleSceneSelect}
          sceneNameInput={sceneNameInput}
          onSceneNameChange={setSceneNameInput}
          onGo={handleGo}
          onNew={handleNew}
        />
      ) : (
        <EditorStage sceneName={sceneName} />
      )}
    </div>
  )
}