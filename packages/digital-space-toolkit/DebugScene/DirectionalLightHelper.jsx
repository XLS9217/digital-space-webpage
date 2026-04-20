import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import GizmoHelper from './GizmoHelper';
import { eventChannelHub, CONTROL_CHANNELS, DEBUG_SCENE_CHANNELS } from '../EventChannelHub';

export default function DirectionalLightHelper({ light, uuid }) {
    const { scene } = useThree();
    const [lightPos, setLightPos] = useState(() => ({
        x: light.position.x,
        y: light.position.y,
        z: light.position.z
    }));

    const [targetPos, setTargetPos] = useState(() => ({
        x: light.target.position.x,
        y: light.target.position.y,
        z: light.target.position.z
    }));

    const lineRef = useRef();
    const cameraHelperRef = useRef();

    const handleLightPositionChange = useCallback((newPos) => {
        setLightPos(newPos);
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, {
            uuid,
            property: 'position',
            value: newPos
        });
        eventChannelHub.publish(DEBUG_SCENE_CHANNELS.LIGHT_PROPERTY_FEEDBACK, {
            uuid,
            property: 'position',
            value: newPos
        });
    }, [uuid]);

    const handleTargetPositionChange = useCallback((newPos) => {
        setTargetPos(newPos);
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, {
            uuid,
            property: 'target',
            value: newPos
        });
        eventChannelHub.publish(DEBUG_SCENE_CHANNELS.LIGHT_PROPERTY_FEEDBACK, {
            uuid,
            property: 'target',
            value: newPos
        });
    }, [uuid]);

    // Update line geometry imperatively when positions change
    useFrame(() => {
        if (lineRef.current) {
            const posAttr = lineRef.current.geometry.getAttribute('position');
            posAttr.array[0] = lightPos.x;
            posAttr.array[1] = lightPos.y;
            posAttr.array[2] = lightPos.z;
            posAttr.array[3] = targetPos.x;
            posAttr.array[4] = targetPos.y;
            posAttr.array[5] = targetPos.z;
            posAttr.needsUpdate = true;
        }
    });

    const boxEdges = React.useMemo(() =>
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.5, 0.5, 0.5))
    , []);

    // Create and manage CameraHelper for shadow camera
    useEffect(() => {
        if (light.shadow && light.shadow.camera) {
            const helper = new THREE.CameraHelper(light.shadow.camera);
            cameraHelperRef.current = helper;
            scene.add(helper);

            return () => {
                scene.remove(helper);
                helper.dispose();
            };
        }
    }, [light, scene]);

    // Update camera helper when light or target moves
    useFrame(() => {
        if (cameraHelperRef.current && light.shadow) {
            // Calculate distance between light and target
            const dx = light.position.x - light.target.position.x;
            const dy = light.position.y - light.target.position.y;
            const dz = light.position.z - light.target.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Update shadow camera far plane to match distance
            light.shadow.camera.far = distance;
            light.shadow.camera.updateProjectionMatrix();
            cameraHelperRef.current.update();

            // Publish advanced properties to debug panel
            eventChannelHub.publish(DEBUG_SCENE_CHANNELS.LIGHT_PROPERTY_FEEDBACK, {
                uuid,
                property: 'advanced',
                value: {
                    shadowCameraFar: light.shadow.camera.far.toFixed(2),
                    shadowCameraLeft: light.shadow.camera.left.toFixed(2),
                    shadowCameraRight: light.shadow.camera.right.toFixed(2),
                    shadowCameraTop: light.shadow.camera.top.toFixed(2),
                    shadowCameraBottom: light.shadow.camera.bottom.toFixed(2),
                    shadowMapSize: light.shadow.mapSize ?
                        `${light.shadow.mapSize.width}x${light.shadow.mapSize.height}` : 'N/A'
                }
            });
        }
    });

    return (
        <group>
            {/* Line from light to target */}
            <line ref={lineRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        array={new Float32Array([
                            lightPos.x, lightPos.y, lightPos.z,
                            targetPos.x, targetPos.y, targetPos.z
                        ])}
                        count={2}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color={0xffff00} />
            </line>

            {/* Cube at light position */}
            <lineSegments position={[lightPos.x, lightPos.y, lightPos.z]} geometry={boxEdges}>
                <lineBasicMaterial color={0xffff00} />
            </lineSegments>

            {/* Cube at target position */}
            <lineSegments position={[targetPos.x, targetPos.y, targetPos.z]} geometry={boxEdges}>
                <lineBasicMaterial color={0xff00ff} />
            </lineSegments>

            {/* Gizmo at light position */}
            <GizmoHelper position={lightPos} onPositionChange={handleLightPositionChange} />

            {/* Gizmo at target position */}
            <GizmoHelper position={targetPos} onPositionChange={handleTargetPositionChange} />
        </group>
    );
}
