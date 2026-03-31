import Stage from './SandBox/Stage/Stage'
import EditorLayout from './Editor/EditorLayout'
import './App.css'

export default function App() {
  const sceneName = 'beijing_white'
  const isEditor = window.location.pathname.startsWith('/Editor')

  return (
    <div className="app">

      {isEditor ? (
        <div className="app__editor">
          <EditorLayout />
        </div>
      ) : (
        <div className="app__stage">
          <Stage sceneName={sceneName} />
        </div>
      )}

    </div>
  )
}