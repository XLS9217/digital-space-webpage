import { useEffect, useState } from 'react'
import EditorTopbar from './EditorTopbar'
import EditorStage from './EditorStage'
import SceneMenu from './SceneMenu/SceneMenu'
import { dataRegistry } from 'digital-space-toolkit'
import { getSceneByName, downloadSceneZip, upsertScene, getFileUrl } from '../API/gateway.js'
import { createScene } from '../API/editor_gateway.js'
import './Editor.css'

export default function EditorLayout() {
  const [sceneName, setSceneName] = useState('')
  const [sceneNameInput, setSceneNameInput] = useState('')
  const [showSceneMenu, setShowSceneMenu] = useState(true)

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


  const handleNew = async (onSceneCreated) => {
    const trimmed = sceneNameInput.trim()
    if (!trimmed) {
      return
    }

    try {
      await createScene(trimmed)
      // Notify SceneMenu to add the new scene to the list
      if (onSceneCreated) {
        const newMeta = {
          sceneName: trimmed,
          displayName: trimmed,
          description: '',
          thumbnail: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        onSceneCreated(newMeta)
      }
      // Clear input after successful creation
      setSceneNameInput('')
    } catch (error) {
      console.error('Failed to create editor scene:', error)
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

  return (
    <div className="editor-layout">
      <EditorTopbar onTitleClick={handleTitleClick} />
      {showSceneMenu ? (
        <SceneMenu
          onSceneSelect={handleSceneSelect}
          sceneNameInput={sceneNameInput}
          onSceneNameChange={setSceneNameInput}
          onNew={handleNew}
        />
      ) : (
        sceneName ? <EditorStage sceneName={sceneName} /> : null
      )}
    </div>
  )
}