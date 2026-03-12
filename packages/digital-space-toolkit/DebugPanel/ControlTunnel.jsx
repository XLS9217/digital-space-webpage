/*
* This stays in the Canvas, use the INTERNAL_DEBUG to send things to debug panel
* */

import React from 'react'//for webpack consistency,
import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { eventChannelHub, CONTROL_CHANNELS } from "../EventChannelHub";
import gsap from "gsap";

export default function ControlTunnel() {
    const { camera, scene } = useThree();

    useEffect(() => {
        const handlePrintScene = () => {
            console.log("Three.js Scene:", scene);
        };

        const handlePrintObject = ({ name }) => {
            const object = scene.getObjectByName(name);
            if (object) {
                console.log(`Three.js Object [${name}]:`, object);
            } else {
                console.warn(`Object with name "${name}" not found in scene`);
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.PRINT_SCENE, handlePrintScene);
        eventChannelHub.subscribe(CONTROL_CHANNELS.PRINT_OBJECT, handlePrintObject);

        // Subscribe to object update requests
        const handleObjectUpdate = (updateData) => {
            const { name, property, value, relative } = updateData;
            console.log(`Received update request for ${name}, property: ${property}, value:`, value);

            // Find object by name in the scene
            const object = scene.getObjectByName(name);
            if (object) {
                console.log(`Found object ${name}:`, object);

                // Apply the update based on property
                if (property === 'position' && object.position) {
                    if (relative) {
                        object.position.set(
                            object.position.x + value.x,
                            object.position.y + value.y,
                            object.position.z + value.z
                        );
                    } else {
                        object.position.set(value.x, value.y, value.z);
                    }
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
                } else if (property === 'visible') {
                    object.visible = value;
                } else if (property === 'name') {
                    object.name = value;
                }

                console.log(`Applied update to ${name}`);
            } else {
                console.warn(`Object with name "${name}" not found in scene`);
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, handleObjectUpdate);

        // Subscribe to animated object updates
        const handleObjectAnimation = (animationData) => {
            const { name, property, value, relative, duration = 1, ease = "power2.out" } = animationData;
            console.log(`Received animation request for ${name}, property: ${property}, value:`, value);

            const object = scene.getObjectByName(name);
            if (object) {
                if (property === 'position' && object.position) {
                    const targetPosition = relative ? {
                        x: object.position.x + value.x,
                        y: object.position.y + value.y,
                        z: object.position.z + value.z
                    } : value;

                    gsap.to(object.position, {
                        x: targetPosition.x,
                        y: targetPosition.y,
                        z: targetPosition.z,
                        duration: duration,
                        ease: ease
                    });
                    console.log(`Started animation for ${name}`);
                }
            } else {
                console.warn(`Object with name "${name}" not found in scene`);
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.OBJECT_ANIMATION, handleObjectAnimation);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.PRINT_SCENE, handlePrintScene);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.PRINT_OBJECT, handlePrintObject);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, handleObjectUpdate);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.OBJECT_ANIMATION, handleObjectAnimation);
        };
    }, [scene]);

    useFrame(() => {

    });

    return null;
}