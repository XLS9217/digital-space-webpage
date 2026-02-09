import { useEffect } from 'react';
import { eventChannelHub, DEBUG_CHANNELS } from '../EventChannelHub';
import BaseModel from './BaseModel';
import FrameModel from './FrameModel';

export default function DigitalScene({ scene_data }) {
    useEffect(() => {
        if (scene_data) {
            eventChannelHub.publish(DEBUG_CHANNELS.INTERNAL_DEBUG_SCENE, scene_data);
        }
    }, [scene_data]);

    if(!scene_data)
    {
        console.log("no scene data yet")
        return null;
    }

    const models = scene_data.models;

    return (
        <group>
            {models.map((model, index) => {
                if (model.type === 'frame') {
                    return <FrameModel key={index} url={model.url} name={model.name} scale={model.scale} />
                } else {
                    return <BaseModel key={index} url={model.url} name={model.name} scale={model.scale} />
                }
            })}
        </group>
    )
}