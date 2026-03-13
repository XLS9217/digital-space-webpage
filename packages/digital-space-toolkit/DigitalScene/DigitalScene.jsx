import React from 'react'//for webpack consistency,
import { useEffect, useState, useRef } from 'react';
import { eventChannelHub, DEBUG_CHANNELS, CONTROL_CHANNELS } from '../EventChannelHub';
import dataRegistry from '../DataRegistry';
import SceneModels from './DigitalModel/SceneModels.jsx';
import SceneLights from "./SceneLights";
import SceneController from './SceneController';

export default function DigitalScene({ sceneName, controllerRef }) {
    const [loaded, setLoaded] = useState(false);
    const [localLights, setLocalLights] = useState([]);
    const [localModels, setLocalModels] = useState([]);
    const controller = useRef(new SceneController()).current;

    // Expose controller to parent via controllerRef
    useEffect(() => {
        if (controllerRef) {
            controllerRef.current = controller;
        }
    }, [controllerRef, controller]);

    const loadScene = () => {
        if (!sceneName || !dataRegistry.load) return;
        dataRegistry.load(sceneName).then(data => {
            setLocalLights(data.lights || []);
            setLocalModels(data.models || []);
            controller.loadGroups(data.groups || []);
            setLoaded(true);
            eventChannelHub.publish(DEBUG_CHANNELS.INTERNAL_DEBUG_SCENE, {
                data,
                controller
            });
            if (data.control) {
                eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_UPDATE, data.control);
            }
        }).catch(err => {
            console.error("Failed to load scene:", err);
        });
    };

    // Load scene data on mount / sceneName change
    useEffect(() => {
        loadScene();
    }, [sceneName]);

    useEffect(() => {
        const handleModelListUpdate = ({ action, name, model }) => {
            if (action === 'add') {
                setLocalModels(prev => [...prev, model]);
            } else if (action === 'remove') {
                setLocalModels(prev => prev.filter(m => m.name !== name));
            }
        };
        const handleLightListUpdate = ({ action, light, index }) => {
            if (action === 'add') {
                setLocalLights(prev => [...prev, light]);
            } else if (action === 'remove') {
                setLocalLights(prev => prev.filter((_, i) => i !== index));
            }
        };
        const handleSceneReload = () => {
            loadScene();
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.MODEL_LIST_UPDATE, handleModelListUpdate);
        eventChannelHub.subscribe(CONTROL_CHANNELS.LIGHT_LIST_UPDATE, handleLightListUpdate);
        eventChannelHub.subscribe(CONTROL_CHANNELS.SCENE_RELOAD, handleSceneReload);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.MODEL_LIST_UPDATE, handleModelListUpdate);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.LIGHT_LIST_UPDATE, handleLightListUpdate);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.SCENE_RELOAD, handleSceneReload);
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