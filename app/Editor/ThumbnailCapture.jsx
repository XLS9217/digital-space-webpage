import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { eventChannelHub } from 'digital-space-toolkit'
import { EDITOR_EVENTS, uploadSceneThumbnail } from './API/editor_gateway.js'

export default function ThumbnailCapture({ sceneName }) {
  const { gl, scene, camera } = useThree()

  useEffect(() => {
    const handleUpsert = async ({ sceneName: upsertedName }) => {
      if (upsertedName !== sceneName) return

      try {
        gl.render(scene, camera)

        const blob = await new Promise((resolve) => {
          gl.domElement.toBlob(resolve, 'image/png')
        })

        if (blob) {
          await uploadSceneThumbnail(sceneName, blob)
        }
      } catch (error) {
        console.error('Failed to capture/upload thumbnail:', error)
      }
    }

    eventChannelHub.subscribe(EDITOR_EVENTS.SCENE_UPSERTED, handleUpsert)

    return () => {
      eventChannelHub.unsubscribe(EDITOR_EVENTS.SCENE_UPSERTED, handleUpsert)
    }
  }, [gl, scene, camera, sceneName])

  return null
}