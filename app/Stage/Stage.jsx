import { useEffect, useRef } from 'react'
import { DigitalSpace, DigitalScene, tagRegistry, dataRegistry } from 'digital-space-toolkit'
import { getSceneByName, downloadSceneZip, upsertScene, getFileUrl } from "../API/gateway.js";
import {ClassroomTag, MeetingTag} from './TagWithStyle.jsx'
import './Stage.css'


export default function Stage({ sceneName = "beijing_white" })
{
    const sceneController = useRef();

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
        <>
            <div className="layer-buttons">
                <button onClick={() => sceneController.current?.investigateLayer('LevelDisplay', 0)}>Layer 4</button>
                <button onClick={() => sceneController.current?.investigateLayer('LevelDisplay', 1)}>Layer 3</button>
                <button onClick={() => sceneController.current?.investigateLayer('LevelDisplay', 2)}>Layer 2</button>
                <button onClick={() => sceneController.current?.investigateLayer('LevelDisplay', 3)}>Layer 1</button>
            </div>

            <DigitalSpace debug={true}>
                <DigitalScene sceneName={sceneName} controllerRef={sceneController} />
            </DigitalSpace>
        </>
    )
}
