/**
 * Use Guide:
 *
 * 1. Use DigitalSpaceControl as a normal component:
 *    <DigitalSpaceControl controlType="orbit" />
 *    or
 *    <DigitalSpaceControl controlType="first-person" />
 *
 * 2. Available control types:
 *    - "orbit": Orbit camera control (default)
 *    - "first-person": First-person pointer lock control
 */

import { OrbitControls, PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React from 'react'//for webpack consistency,
import { useRef, useEffect, useState } from 'react'
import { eventChannelHub, INFO_CHANNELS, CONTROL_CHANNELS, DEBUG_SCENE_CHANNELS } from './EventChannelHub'
import { CONTROL_TYPE } from './SceneTypeEnum'
import gsap from 'gsap'

export default function DigitalSpaceControl({ controlType = CONTROL_TYPE.ORBIT }) {
    const { camera } = useThree()
    const orbitControlsRef = useRef()
    const [controlSettings, setControlSettings] = useState({
        minDistance: 1,
        maxDistance: 100,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        enablePan: true,
        enableRotate: true,
        enableZoom: true
    })

    // Subscribe to camera control settings updates
    useEffect(() => {
        const handleSettingsUpdate = (settings) => {
            setControlSettings(prev => ({ ...prev, ...settings }));

            // Apply to orbit controls
            if (orbitControlsRef.current) {
                Object.keys(settings).forEach(key => {
                    orbitControlsRef.current[key] = settings[key];
                });
            }
        };

        const handlePrintControl = () => {
            if (orbitControlsRef.current) {
                console.log("Three.js OrbitControls:", orbitControlsRef.current);
            } else {
                console.warn("OrbitControls not available");
            }
        };

        eventChannelHub.subscribe(
            CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE,
            handleSettingsUpdate
        );
        eventChannelHub.subscribe(
            CONTROL_CHANNELS.PRINT_CONTROL,
            handlePrintControl
        );

        return () => {
            eventChannelHub.unsubscribe(
                CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE,
                handleSettingsUpdate
            );
            eventChannelHub.unsubscribe(
                CONTROL_CHANNELS.PRINT_CONTROL,
                handlePrintControl
            );
        };
    }, []);

    // Subscribe to camera control updates
    useEffect(() => {
        const handleControlUpdate = (controlData) => {
            if (!controlData) return;

            // Update camera position
            if (controlData.position) {
                camera.position.set(
                    controlData.position.x,
                    controlData.position.y,
                    controlData.position.z
                );
            }

            // Update orbit controls target if available
            if (controlData.target && orbitControlsRef.current) {
                orbitControlsRef.current.target.set(
                    controlData.target.x,
                    controlData.target.y,
                    controlData.target.z
                );
                orbitControlsRef.current.update();
            }

            // Update camera rotation for first-person controls
            if (controlData.rotation) {
                camera.rotation.set(
                    controlData.rotation.x,
                    controlData.rotation.y,
                    controlData.rotation.z
                );
            }

            // Load zoom and angle settings from scene data
            if (controlData.zoom) {
                setControlSettings(prev => ({
                    ...prev,
                    minDistance: controlData.zoom.min ?? prev.minDistance,
                    maxDistance: controlData.zoom.max ?? prev.maxDistance
                }));

                if (orbitControlsRef.current) {
                    orbitControlsRef.current.minDistance = controlData.zoom.min;
                    orbitControlsRef.current.maxDistance = controlData.zoom.max;
                }
            }

            if (controlData.angle) {
                setControlSettings(prev => ({
                    ...prev,
                    minPolarAngle: controlData.angle.min ?? prev.minPolarAngle,
                    maxPolarAngle: controlData.angle.max ?? prev.maxPolarAngle
                }));

                if (orbitControlsRef.current) {
                    orbitControlsRef.current.minPolarAngle = controlData.angle.min;
                    orbitControlsRef.current.maxPolarAngle = controlData.angle.max;
                }
            }

            // Load enable settings from scene data
            if (controlData.enablePan !== undefined) {
                setControlSettings(prev => ({ ...prev, enablePan: controlData.enablePan }));
                if (orbitControlsRef.current) {
                    orbitControlsRef.current.enablePan = controlData.enablePan;
                }
            }
            if (controlData.enableRotate !== undefined) {
                setControlSettings(prev => ({ ...prev, enableRotate: controlData.enableRotate }));
                if (orbitControlsRef.current) {
                    orbitControlsRef.current.enableRotate = controlData.enableRotate;
                }
            }
            if (controlData.enableZoom !== undefined) {
                setControlSettings(prev => ({ ...prev, enableZoom: controlData.enableZoom }));
                if (orbitControlsRef.current) {
                    orbitControlsRef.current.enableZoom = controlData.enableZoom;
                }
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.CAMERA_CONTROL_UPDATE, handleControlUpdate);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.CAMERA_CONTROL_UPDATE, handleControlUpdate);
        };
    }, [camera]);

    // Subscribe to camera animation requests
    useEffect(() => {
        const handleCameraAnimation = (animationData) => {
            const { position, target, duration = 1, ease = "power2.out", onComplete } = animationData;
            console.log('Received camera animation request:', animationData);

            // Animate camera position
            if (position) {
                gsap.to(camera.position, {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                    duration: duration,
                    ease: ease
                });
            }

            // Animate orbit controls target
            if (target && orbitControlsRef.current) {
                gsap.to(orbitControlsRef.current.target, {
                    x: target.x,
                    y: target.y,
                    z: target.z,
                    duration: duration,
                    ease: ease,
                    onUpdate: () => {
                        orbitControlsRef.current.update();
                    },
                    onComplete: () => {
                        console.log('Camera animation completed');
                        if (onComplete) {
                            onComplete();
                        }
                    }
                });
            } else if (position && onComplete) {
                // If no target animation, attach onComplete to position animation
                gsap.to(camera.position, {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                    duration: duration,
                    ease: ease,
                    onComplete: () => {
                        console.log('Camera animation completed');
                        onComplete();
                    }
                });
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.CAMERA_ANIMATION, handleCameraAnimation);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.CAMERA_ANIMATION, handleCameraAnimation);
        };
    }, [camera]);

    // Subscribe to controls enable/disable from debug scene
    useEffect(() => {
        const handleControlsEnable = ({ enabled }) => {
            if (orbitControlsRef.current) {
                orbitControlsRef.current.enabled = enabled;
            }
        };

        eventChannelHub.subscribe(DEBUG_SCENE_CHANNELS.CONTROLS_ENABLE, handleControlsEnable);

        return () => {
            eventChannelHub.unsubscribe(DEBUG_SCENE_CHANNELS.CONTROLS_ENABLE, handleControlsEnable);
        };
    }, []);

    useFrame(() => {
        let controlInfo

        if (controlType === CONTROL_TYPE.ORBIT) {
            // For orbit controls: type, position (xyz), target (xyz), zoom, angle
            const target = orbitControlsRef.current?.target || { x: 0, y: 0, z: 0 }

            // Get current distance and polar angle from OrbitControls
            const currentDistance = orbitControlsRef.current?.getDistance?.() || 0;
            const currentPolarAngle = orbitControlsRef.current?.getPolarAngle?.() || 0;

            controlInfo = {
                type: CONTROL_TYPE.ORBIT,
                position: {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                },
                target: {
                    x: target.x,
                    y: target.y,
                    z: target.z
                },
                zoom: {
                    min: controlSettings.minDistance,
                    max: controlSettings.maxDistance,
                    current: currentDistance
                },
                angle: {
                    min: controlSettings.minPolarAngle,
                    max: controlSettings.maxPolarAngle,
                    current: currentPolarAngle
                },
                enablePan: controlSettings.enablePan,
                enableRotate: controlSettings.enableRotate,
                enableZoom: controlSettings.enableZoom
            }
        } else if (controlType === CONTROL_TYPE.FIRST_PERSON) {
            // For first person: type, position (xyz), rotation (xyz)
            controlInfo = {
                type: CONTROL_TYPE.FIRST_PERSON,
                position: {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                },
                rotation: {
                    x: camera.rotation.x,
                    y: camera.rotation.y,
                    z: camera.rotation.z
                }
            }
        }
        // console.log(controlInfo)
        // Publish to the CONTROL_INFO channel
        eventChannelHub.publish(INFO_CHANNELS.CAMERA_CONTROL_INFO, controlInfo)

    })

    return (
        <>
            {controlType === CONTROL_TYPE.ORBIT ? (
                <OrbitControls
                    ref={orbitControlsRef}
                    minDistance={controlSettings.minDistance}
                    maxDistance={controlSettings.maxDistance}
                    minPolarAngle={controlSettings.minPolarAngle}
                    maxPolarAngle={controlSettings.maxPolarAngle}
                    enablePan={controlSettings.enablePan}
                    enableRotate={controlSettings.enableRotate}
                    enableZoom={controlSettings.enableZoom}
                />
            ) : (
                <PointerLockControls />
            )}
        </>
    )
}