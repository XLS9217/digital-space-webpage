import React from 'react'//for webpack consistency,
import { useEffect, useState } from 'react';
import { eventChannelHub, DEBUG_CHANNELS, CONTROL_CHANNELS } from '../EventChannelHub';
import dataRegistry from '../DataRegistry';
import SceneModels from './DigitalModel/SceneModels.jsx';
import SceneLights from "./SceneLights";

export default function DigitalScene({ sceneName }) {
    const [loaded, setLoaded] = useState(false);
    const [localLights, setLocalLights] = useState([]);
    const [localModels, setLocalModels] = useState([]);

    // Load scene data, sync local state, and publish to debug panel
    useEffect(() => {
        if (!sceneName || !dataRegistry.load) return;
        dataRegistry.load(sceneName).then(data => {
            setLocalLights(data.lights || []);
            setLocalModels(data.models || []);
            setLoaded(true);
            eventChannelHub.publish(DEBUG_CHANNELS.INTERNAL_DEBUG_SCENE, data);
            if (data.control) {
                eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_UPDATE, data.control);
            }
        }).catch(err => {
            console.error("Failed to load scene:", err);
        });
    }, [sceneName]);

    useEffect(() => {
        const handleModelListUpdate = (data) => {
            console.log("model list update triggers", data);
        };
        const handleLightListUpdate = ({ action, light, index }) => {
            if (action === 'add') {
                setLocalLights(prev => [...prev, light]);
            } else if (action === 'remove') {
                setLocalLights(prev => prev.filter((_, i) => i !== index));
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.MODEL_LIST_UPDATE, handleModelListUpdate);
        eventChannelHub.subscribe(CONTROL_CHANNELS.LIGHT_LIST_UPDATE, handleLightListUpdate);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.MODEL_LIST_UPDATE, handleModelListUpdate);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.LIGHT_LIST_UPDATE, handleLightListUpdate);
        };
    }, []);

    // const { scene } = useThree();
    // console.log(scene);
    if(!loaded)
    {
        console.log("no scene data yet")
        return null;
    }


    return (
        <group>
            <SceneLights lights={localLights} />
            <SceneModels models={localModels} />
        </group>
    )
}