import { useEffect, useState } from 'react'
import { deleteEditorScene, listScenesMetadata } from '../../API/editor_gateway.js'
import EditorTextbox from '../CommonComponent/EditorTextbox'
import EditorButton from '../CommonComponent/EditorButton'
import DeleteWindow from './DeleteWindow'
import './SceneMenu.css'

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function SceneMenu({
  onSceneSelect,
  sceneNameInput,
  onSceneNameChange,
  onNew
}) {
  const [scenes, setScenes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSceneCreated = (newMeta) => {
    setScenes((prev) => [newMeta, ...prev])
  }

  const handleNewClick = () => {
    onNew?.(handleSceneCreated)
  }

  useEffect(() => {
    let isMounted = true

    const loadScenes = async () => {
      setIsLoading(true)
      setError('')
      try {
        const metaList = await listScenesMetadata()
        if (isMounted) {
          setScenes(Array.isArray(metaList) ? metaList : [])
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

  const handleDeleteOpen = (meta) => {
    setDeleteError('')
    setDeleteTarget(meta)
  }

  const handleDeleteClose = () => {
    if (isDeleting) return
    setDeleteTarget(null)
    setDeleteError('')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteEditorScene(deleteTarget.sceneName)
      setScenes((prev) => prev.filter((s) => s.sceneName !== deleteTarget.sceneName))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError('Failed to delete scene.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="scene-menu">
      <div className="scene-menu__header">Scenes</div>
      <div className="scene-menu__controls">
        <EditorTextbox
          value={sceneNameInput}
          onChange={onSceneNameChange}
          placeholder="Scene name"
        />
        <EditorButton onClick={handleNewClick}>NEW</EditorButton>
      </div>
      {isLoading && <div className="scene-menu__message">Loading...</div>}
      {!isLoading && error && <div className="scene-menu__message">{error}</div>}
      {!isLoading && !error && scenes.length === 0 && (
        <div className="scene-menu__message">No scenes yet.</div>
      )}
      {!isLoading && scenes.length > 0 && (
        <div className="scene-menu__list">
          {scenes.map((meta) => (
            <div
              key={meta.sceneName}
              className="scene-card"
              onClick={() => onSceneSelect?.(meta.sceneName)}
            >
              <div className="scene-card__thumbnail">
                {meta.thumbnail
                  ? <img src={meta.thumbnail} alt={meta.displayName} />
                  : <div className="scene-card__no-thumb">No preview</div>
                }
              </div>
              <div className="scene-card__info">
                <div className="scene-card__title">
                  {meta.displayName || meta.sceneName}
                  {meta.displayName && meta.displayName !== meta.sceneName && (
                    <span className="scene-card__scene-name"> ({meta.sceneName})</span>
                  )}
                </div>
                {meta.description && (
                  <div className="scene-card__description">{meta.description}</div>
                )}
                <div className="scene-card__dates">
                  {meta.createdAt && <span>Created {formatDate(meta.createdAt)}</span>}
                  {meta.updatedAt && <span>Updated {formatDate(meta.updatedAt)}</span>}
                </div>
              </div>
              <button
                type="button"
                className="scene-card__delete"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteOpen(meta)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {deleteTarget && (
        <DeleteWindow
          sceneName={deleteTarget.sceneName}
          onCancel={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  )
}