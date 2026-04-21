/*
* This stays in the Canvas, use the INTERNAL_DEBUG to send things to debug panel
* */

import React from 'react'//for webpack consistency,
import { useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Perf } from 'r3f-perf';
import { eventChannelHub, CONTROL_CHANNELS, DEBUG_CHANNELS } from "../EventChannelHub";
import sceneObjectRegistry from "../DigitalScene/SceneObjectRegistry";
import * as THREE from "three";
import gsap from "gsap";
import { infoStoreHub } from "../InfoStoreHub";

export default function ControlTunnel() {
    const { camera, scene, gl } = useThree();
    const [showPerf, setShowPerf] = useState(false);
    const [perfPosition, setPerfPosition] = useState('bottom-right');
    const frameCountRef = React.useRef(0);
    const lastTimeRef = React.useRef(performance.now());

    useEffect(() => {
        const handlePrintScene = () => {
            console.log("Three.js Scene:", scene);
        };

        const handlePrintObject = ({ uuid }) => {
            const obj = sceneObjectRegistry.getThreeObject(uuid);
            if (obj) {
                console.log(`Three.js Object [${uuid}]:`, obj);
            } else {
                console.warn(`Object with uuid "${uuid}" not found in registry`);
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.PRINT_SCENE, handlePrintScene);
        eventChannelHub.subscribe(CONTROL_CHANNELS.PRINT_OBJECT, handlePrintObject);

        // UUID-based object updates
        const handleObjectUpdate = ({ uuid, property, value, relative }) => {
            const object = sceneObjectRegistry.getThreeObject(uuid);
            if (!object) {
                console.warn(`Object with uuid "${uuid}" not found in registry`);
                return;
            }

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
            } else if (property === 'target' && object.target) {
                object.target.position.set(value.x, value.y, value.z);
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
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.OBJECT_UPDATE, handleObjectUpdate);

        // UUID-based animated updates
        const handleObjectAnimation = ({ uuid, property, value, relative, duration = 1, ease = "power2.out", onComplete }) => {
            const object = sceneObjectRegistry.getThreeObject(uuid);
            if (!object) {
                console.warn(`Object with uuid "${uuid}" not found for animation`);
                return;
            }

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
                    duration,
                    ease,
                    onComplete: () => {
                        if (onComplete) onComplete(uuid);
                    }
                });
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.OBJECT_ANIMATION, handleObjectAnimation);

        // Scene background updates
        const handleBackgroundUpdate = ({ color, enabled, fog }) => {
            if (enabled) {
                if (!scene.background) {
                    scene.background = new THREE.Color(color);
                } else {
                    scene.background.set(color);
                }
            } else {
                scene.background = null;
            }

            if (fog?.enabled) {
                const fogColor = new THREE.Color(color);
                if (!scene.fog) {
                    scene.fog = new THREE.Fog(fogColor, fog.near, fog.far);
                } else {
                    scene.fog.color.copy(fogColor);
                    scene.fog.near = fog.near;
                    scene.fog.far = fog.far;
                }
            } else {
                scene.fog = null;
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.SCENE_BACKGROUND_UPDATE, handleBackgroundUpdate);

        // Performance window toggle
        const handlePerfToggle = ({ enabled, position }) => {
            setShowPerf(enabled);
            if (position) {
                setPerfPosition(position);
            }
        };

        eventChannelHub.subscribe(DEBUG_CHANNELS.PERF_WINDOW_TOGGLE, handlePerfToggle);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.PRINT_SCENE, handlePrintScene);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.PRINT_OBJECT, handlePrintObject);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.OBJECT_UPDATE, handleObjectUpdate);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.OBJECT_ANIMATION, handleObjectAnimation);
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.SCENE_BACKGROUND_UPDATE, handleBackgroundUpdate);
            eventChannelHub.unsubscribe(DEBUG_CHANNELS.PERF_WINDOW_TOGGLE, handlePerfToggle);
        };
    }, [scene]);

    useFrame(() => {

    });

    return (
        <>
            {showPerf && <Perf position={perfPosition} />}
        </>
    );
}
