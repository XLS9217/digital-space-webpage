import { useEffect, useRef } from 'react'
import { DigitalSpace, DigitalScene, tagRegistry, dataRegistry } from 'digital-space-toolkit'
import { getSceneByName, downloadSceneZip, upsertScene, getFileUrl } from '../API/gateway.js'
import { ClassroomTag, MeetingTag } from '../Stage/TagWithStyle.jsx'
import '../Stage/Stage.css'

export default function EditorStage({ sceneName }) {
  const sceneController = useRef()

  useEffect(() => {
    tagRegistry
      .register('CLASSROOM', ClassroomTag, { distanceFactor: 40 })
      .register('MEETING', MeetingTag)

    dataRegistry
      .registerLoad(getSceneByName)
      .registerUpsert(upsertScene)
      .registerDownload(downloadSceneZip)
      .registerGetFileUrl(getFileUrl)

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