import { useEffect, useRef, useState } from 'react'
import './SceneMenu.css'

export default function DeleteWindow({ sceneName, onCancel, onConfirm, isDeleting, error }) {
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)
  const progressRef = useRef(null)
  const ringCircumference = 2 * Math.PI * 24

  useEffect(() => {
    const startTime = performance.now()
    const duration = 2000

    const tick = (now) => {
      const elapsed = now - startTime
      const p = Math.min(1, elapsed / duration)
      setProgress(p)
      if (p < 1) {
        progressRef.current = requestAnimationFrame(tick)
      } else {
        setComplete(true)
      }
    }

    progressRef.current = requestAnimationFrame(tick)
    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [])

  const handleClick = () => {
    if (complete && !isDeleting) {
      onConfirm?.()
    }
  }

  return (
    <div className="delete-window__backdrop" onClick={onCancel}>
      <div className="delete-window" onClick={(e) => e.stopPropagation()}>
        <div className="delete-window__title">DELETE {sceneName} ?</div>
        {error && <div className="delete-window__error">{error}</div>}
        <div className="delete-window__ok-wrapper">
          <button
            type="button"
            className={`delete-window__ok${complete ? ' is-ready' : ''}`}
            disabled={isDeleting}
            onClick={handleClick}
          >
            <svg className="delete-window__ok-ring" viewBox="0 0 56 56" aria-hidden="true">
              <circle className="delete-window__ok-track" cx="28" cy="28" r="24" />
              <circle
                className="delete-window__ok-progress"
                cx="28"
                cy="28"
                r="24"
                style={{
                  strokeDasharray: ringCircumference,
                  strokeDashoffset: ringCircumference * (1 - progress)
                }}
              />
            </svg>
            <span className="delete-window__ok-label">
              {isDeleting ? '...' : 'OK'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}