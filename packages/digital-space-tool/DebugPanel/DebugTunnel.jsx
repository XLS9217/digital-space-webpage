/*
* This stays in the Canvas, use the INTERNAL_DEBUG to send things to debug panel
* */

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { eventChannelHub, DEBUG_CHANNELS, CONTROL_CHANNELS } from "../EventChannelHub";

export default function DebugTunnel() {
    const { camera, scene } = useThree();

    useEffect(() => {
        // Subscribe to object update requests
        const handleObjectUpdate = (updateData) => {
            const { name, property, value } = updateData;
            console.log(`Received update request for ${name}, property: ${property}, value:`, value);

            // Find object by name in the scene
            const object = scene.getObjectByName(name);
            if (object) {
                console.log(`Found object ${name}:`, object);

                // Apply the update based on property
                if (property === 'position' && object.position) {
                    object.position.set(value.x, value.y, value.z);
                } else if (property === 'rotation' && object.rotation) {
                    object.rotation.set(value.x, value.y, value.z);
                } else if (property === 'scale' && object.scale) {
                    if (typeof value === 'number') {
                        object.scale.set(value, value, value);
                    } else {
                        object.scale.set(value.x, value.y, value.z);
                    }
                } else if (property === 'intensity' && 'intensity' in object) {
                    object.intensity = value;
                } else if (property === 'color' && object.color) {
                    object.color.set(value);
                }

                console.log(`Applied update to ${name}`);
            } else {
                console.warn(`Object with name "${name}" not found in scene`);
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, handleObjectUpdate);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, handleObjectUpdate);
        };
    }, [scene]);

    useFrame(() => {

    });

    return null;
}