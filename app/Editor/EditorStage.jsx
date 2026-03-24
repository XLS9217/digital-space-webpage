import { useEffect, useRef } from 'react'
import { DigitalSpace, DigitalScene, tagRegistry, dataRegistry } from 'digital-space-toolkit'
import { ClassroomTag, MeetingTag } from '../Stage/TagWithStyle.jsx'
import '../Stage/Stage.css'

export default function EditorStage({ sceneName }) {
  const sceneController = useRef()

  useEffect(() => {
    if (!dataRegistry) {
      return undefined
    }

    tagRegistry
      .register('CLASSROOM', ClassroomTag, { distanceFactor: 40 })
      .register('MEETING', MeetingTag)

    return () => {
      tagRegistry
        .unregister('CLASSROOM')
        .unregister('MEETING')
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