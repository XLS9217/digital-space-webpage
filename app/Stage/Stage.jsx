import { useState, useEffect } from 'react'
import DigitalSpace from 'digital-space-tool/DigitalSpace.jsx'
import DigitalScene from "digital-space-tool/DigitalScene.jsx";
import tagRegistry from 'digital-space-tool/TagRegistry.js'
import { getSceneByName } from "../API/gateway.js";
import './Stage.css'

function ClassroomTag({ name }) {
    return (
        <div className="stage-tag stage-tag--classroom">
            {name}
        </div>
    )
}

function MeetingTag({ name }) {
    return (
        <div className="stage-tag stage-tag--meeting">
            {name}
        </div>
    )
}

tagRegistry
    .register('CLASSROOM', ClassroomTag, { distanceFactor: 40 })
    .register('MEETING', MeetingTag)

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

    return (
        <DigitalSpace
            debug={true}
        >
            <DigitalScene scene_data={sceneData} />
        </DigitalSpace>
    )
}
