import { useEffect } from 'react'
import { DigitalSpace, DigitalScene, tagRegistry, dataRegistry } from 'digital-space-toolkit'
import { getSceneByName, downloadSceneZip, upsertScene } from "../API/gateway.js";
import {ClassroomTag, MeetingTag} from './TagWithStyle.jsx'
import './Stage.css'


export default function Stage()
{
    useEffect(() => {
        tagRegistry
            .register('CLASSROOM', ClassroomTag, { distanceFactor: 40 })
            .register('MEETING', MeetingTag)

        dataRegistry
            .registerLoad(getSceneByName)
            .registerUpsert(upsertScene)
            .registerDownload(downloadSceneZip)

        return () => {
            tagRegistry
                .unregister('CLASSROOM')
                .unregister('MEETING')
        }
    }, [])

    return (
        <DigitalSpace
            debug={true}
        >
            <DigitalScene sceneName="beijing_white" />
        </DigitalSpace>
    )
}
