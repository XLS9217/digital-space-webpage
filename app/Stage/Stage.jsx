import { useState, useEffect } from 'react'
import DigitalSpace from 'digital-space-tool/DigitalSpace.jsx'
import DigitalScene from "digital-space-tool/DigitalScene.jsx";
import { getSceneByName } from "../API/gateway.js";

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
