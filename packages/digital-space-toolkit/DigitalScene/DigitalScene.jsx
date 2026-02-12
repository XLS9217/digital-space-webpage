import { useEffect } from 'react';
import { eventChannelHub, DEBUG_CHANNELS, CONTROL_CHANNELS } from '../EventChannelHub';
import BaseModel from './BaseModel';
import FrameModel from './FrameModel';
import SceneLights from "./SceneLights";
import {useThree} from "@react-three/fiber";

export default function DigitalScene({ scene_data }) {
    useEffect(() => {
        if (scene_data) {
            eventChannelHub.publish(DEBUG_CHANNELS.INTERNAL_DEBUG_SCENE, scene_data);

            // Send control data if it exists
            if (scene_data.control) {
                eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_UPDATE, scene_data.control);
            }

        }
    }, [scene_data]);

    const { scene } = useThree();
    console.log(scene);
    if(!scene_data)
    {
        console.log("no scene data yet")
        return null;
    }


    const models = scene_data.models || [];
    const lights = scene_data.lights || [];


    return (
        <group>
            <SceneLights lights={lights} />
            {models.map((model, index) => {
                console.log(`Model type: ${model.type}, name: ${model.name}`);
                const modelProps = {
                    key: index,
                    url: model.url,
                    name: model.name,
                    scale: model.scale,
                    position: model.position,
                    rotation: model.rotation
                };
                if (model.type === 'frame') {
                    return <FrameModel {...modelProps} />
                } else {
                    return <BaseModel {...modelProps} />
                }
            })}
        </group>
    )
}