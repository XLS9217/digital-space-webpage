import { useState, useEffect } from 'react'
import DigitalSpace from 'digital-space-tool/DigitalSpace.jsx'
import DigitalScene from "digital-space-tool/DigitalScene/DigitalScene.jsx";
import { getSceneByName } from "../API/gateway.js";
import TagStyleRegister from './TagStyleRegister.jsx'
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

    return (
        <DigitalSpace
            debug={true}
        >
            <TagStyleRegister />
            <DigitalScene scene_data={sceneData} />
        </DigitalSpace>
    )
}
