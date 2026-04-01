import { useEffect, useRef } from 'react'
import { DigitalSpace, DigitalScene, tagRegistry, dataRegistry } from 'digital-space-toolkit'
import { ClassroomTag, MeetingTag } from '../SandBox/Stage/TagWithStyle.jsx'
import ThumbnailCapture from './ThumbnailCapture.jsx'
import EditorTag from './EditorTag.jsx'
import '../SandBox/Stage/Stage.css'

export default function EditorStage({ sceneName }) {
  const sceneController = useRef()

  useEffect(() => {
    if (!dataRegistry) {
      return undefined
    }

    tagRegistry.register('DEFAULT', EditorTag, {
      distanceFactor: 20.0,
      minSize: 0.5,
      maxSize: 1,
      magnifyDistance: 200
    })

    return () => {
      tagRegistry.unregister('DEFAULT')
    }
  }, [])

  return (
    <div className="editor-stage">
      <DigitalSpace debug={true}>
        <DigitalScene sceneName={sceneName} controllerRef={sceneController} />
        <ThumbnailCapture sceneName={sceneName} />
      </DigitalSpace>
    </div>
  )
}