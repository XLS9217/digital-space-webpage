import React from 'react'//for webpack consistency,
import { useEffect, useState } from 'react';
import { eventChannelHub, DEBUG_CHANNELS, CONTROL_CHANNELS } from '../EventChannelHub';
import { MODEL_TYPE } from '../SceneTypeEnum';
import dataRegistry from '../DataRegistry';
import BaseModel from './BaseModel';
import FrameModel from './FrameModel';
import SceneLights from "./SceneLights";
import {useThree} from "@react-three/fiber";

export default function DigitalScene({ sceneName }) {
    const [sceneData, setSceneData] = useState(null);
    const [localLights, setLocalLights] = useState([]);

    // Load scene data using dataRegistry
    useEffect(() => {
        if (!sceneName || !dataRegistry.load) return;
        dataRegistry.load(sceneName).then(data => {
            setSceneData(data);
        }).catch(err => {
            console.error("Failed to load scene:", err);
        });
    }, [sceneName]);

    // Sync local lights from scene data
    useEffect(() => {
        if (sceneData?.lights) {
            setLocalLights(sceneData.lights);
        }
    }, [sceneData]);

    useEffect(() => {
        if (sceneData) {
            eventChannelHub.publish(DEBUG_CHANNELS.INTERNAL_DEBUG_SCENE, sceneData);

            // Send control data if it exists
            if (sceneData.control) {
                eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_UPDATE, sceneData.control);
            }

        }
    }, [sceneData]);

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
    if(!sceneData)
    {
        console.log("no scene data yet")
        return null;
    }


    const models = sceneData.models || [];


    return (
        <group>
            <SceneLights lights={localLights.length > 0 ? localLights : sceneData.lights} />
            {models.map((model, index) => {
                //console.log(`Model type: ${model.type}, name: ${model.name}`);
                const modelProps = {
                    url: model.url,
                    name: model.name,
                    scale: model.scale,
                    position: model.position,
                    rotation: model.rotation
                };
                if (model.type === MODEL_TYPE.FRAME) {
                    return <FrameModel key={index} {...modelProps} />
                } else {
                    return <BaseModel key={index} {...modelProps} />
                }
            })}
        </group>
    )
}