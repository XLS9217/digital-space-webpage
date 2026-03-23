import { useState } from 'react'
import Stage from './Stage/Stage'
import './App.css'

export default function App() {
  const [sceneName, setSceneName] = useState("beijing_white")

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