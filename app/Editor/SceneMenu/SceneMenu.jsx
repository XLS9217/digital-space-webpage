import { useEffect, useState } from 'react'
import { listEditorScenes } from '../../API/editor_gateway.js'
import EditorTextbox from '../CommonComponent/EditorTextbox'
import EditorButton from '../CommonComponent/EditorButton'
import './SceneMenu.css'

export default function SceneMenu({
  onSceneSelect,
  sceneNameInput,
  onSceneNameChange,
  onGo,
  onNew
}) {
  const [scenes, setScenes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onGo?.()
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadScenes = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await listEditorScenes()
        const names = Array.isArray(response)
          ? response
              .map((item) => {
                if (typeof item === 'string') {
                  return item
                }
                return item?.scene || item?.name || ''
              })
              .filter(Boolean)
          : []
        if (isMounted) {
          setScenes(names)
        }
      } catch (err) {
        if (isMounted) {
          setScenes([])
          setError('Failed to load scenes.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadScenes()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="scene-menu">
      <div className="scene-menu__header">Scenes</div>
      <div className="scene-menu__controls">
        <EditorTextbox
          value={sceneNameInput}
          onChange={onSceneNameChange}
          onKeyDown={handleKeyDown}
          placeholder="Scene name"
        />
        <EditorButton onClick={onGo}>GO</EditorButton>
        <EditorButton onClick={onNew}>NEW</EditorButton>
      </div>
      {isLoading && <div className="scene-menu__message">Loading...</div>}
      {!isLoading && error && <div className="scene-menu__message">{error}</div>}
      {!isLoading && !error && scenes.length === 0 && (
        <div className="scene-menu__message">No scenes yet.</div>
      )}
      {!isLoading && scenes.length > 0 && (
        <div className="scene-menu__tags">
          {scenes.map((scene) => (
            <button
              key={scene}
              type="button"
              className="scene-menu__tag"
              onClick={() => onSceneSelect?.(scene)}
            >
              {scene}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}