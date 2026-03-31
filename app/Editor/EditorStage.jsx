import { useEffect, useRef } from 'react'
import { DigitalSpace, DigitalScene, tagRegistry, dataRegistry } from 'digital-space-toolkit'
import { ClassroomTag, MeetingTag } from '../SandBox/Stage/TagWithStyle.jsx'
import '../SandBox/Stage/Stage.css'

export default function EditorStage({ sceneName }) {
  const sceneController = useRef()

  useEffect(() => {
    if (!dataRegistry) {
      return undefined
    }
  }, [])

  return (
    <div className="editor-stage">
      <DigitalSpace debug={true}>
        <DigitalScene sceneName={sceneName} controllerRef={sceneController} />
      </DigitalSpace>
    </div>
  )
}