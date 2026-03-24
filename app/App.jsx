import { useState } from 'react'
import Stage from './Stage/Stage'
import './App.css'

function getSceneNameFromURL() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('sceneName')) return params.get('sceneName')

  const match = window.location.pathname.match(/sceneName=([^/&]+)/)
  if (match) return match[1]

  return "beijing_white"
}

export default function App() {
  const [sceneName, setSceneName] = useState(getSceneNameFromURL)

  return (
    <div className="app">


        {/* Use comment to toggle */}

      <div className="app__stage">
        <Stage sceneName={sceneName} />
      </div>

      <div className="app__editor">
        {/* Editor UI goes here */}
      </div>

    </div>
  )
}