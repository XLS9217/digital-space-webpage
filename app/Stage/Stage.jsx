import { useState, useEffect } from 'react'
import { DigitalSpace, DigitalScene, tagRegistry, webRegistry } from 'digital-space-toolkit'
import { getSceneByName, downloadSceneZip, upsertScene } from "../API/gateway.js";
import {ClassroomTag, MeetingTag} from './TagWithStyle.jsx'
import './Stage.css'


export default function Stage()
{
    const [sceneData, setSceneData] = useState(null)

    useEffect(() => {
        getSceneByName("beijing_white").then(data => {
            setSceneData(data)
            console.log(data)
        }).catch(err => {
            console.error("Failed to fetch scene:", err)
        })
    }, [])

    useEffect(() => {
        tagRegistry
            .register('CLASSROOM', ClassroomTag, { distanceFactor: 40 })
            .register('MEETING', MeetingTag)

        webRegistry
            // .registerUpload(upsertScene)
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
            <DigitalScene scene_data={sceneData} />
        </DigitalSpace>
    )
}
