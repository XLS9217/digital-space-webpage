import { useState, useEffect } from 'react'
import { DigitalSpace, DigitalScene, tagRegistry } from 'digital-space-toolkit'
import { getSceneByName } from "../API/gateway.js";
import {ClassroomTag, MeetingTag} from './TagWithStyle.jsx'
import './Stage.css'


export default function Stage()
{
    const [sceneData, setSceneData] = useState(null)

    useEffect(() => {
        getSceneByName("test_scene_2").then(data => {
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
