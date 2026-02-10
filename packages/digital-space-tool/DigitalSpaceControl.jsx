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
import { useRef, useEffect } from 'react'
import { eventChannelHub, INFO_CHANNELS, CONTROL_CHANNELS } from './EventChannelHub'

export const ControlStyle = {
    ORBIT: 'orbit',
    FIRST_PERSON: 'first-person'
}

export default function DigitalSpaceControl({ controlType = ControlStyle.ORBIT }) {
    const { camera } = useThree()
    const orbitControlsRef = useRef()

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
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.CAMERA_CONTROL_UPDATE, handleControlUpdate);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.CAMERA_CONTROL_UPDATE, handleControlUpdate);
        };
    }, [camera]);

    useFrame(() => {
        let controlInfo

        if (controlType === ControlStyle.ORBIT) {
            // For orbit controls: type, position (xyz), target (xyz)
            const target = orbitControlsRef.current?.target || { x: 0, y: 0, z: 0 }
            controlInfo = {
                type: ControlStyle.ORBIT,
                position: {
                    x: camera.position.x,
                    y: camera.position.y,
                    z: camera.position.z
                },
                target: {
                    x: target.x,
                    y: target.y,
                    z: target.z
                }
            }
        } else if (controlType === ControlStyle.FIRST_PERSON) {
            // For first person: type, position (xyz), rotation (xyz)
            controlInfo = {
                type: ControlStyle.FIRST_PERSON,
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
            {controlType === ControlStyle.ORBIT ? (
                <OrbitControls ref={orbitControlsRef} />
            ) : (
                <PointerLockControls />
            )}
        </>
    )
}