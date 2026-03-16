import React, { useState, useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GizmoHelper from './GizmoHelper';
import { eventChannelHub, CONTROL_CHANNELS, DEBUG_SCENE_CHANNELS } from '../EventChannelHub';

export default function DirectionalLightHelper({ light, lightName }) {
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

    const handleLightPositionChange = useCallback((newPos) => {
        setLightPos(newPos);
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
            name: lightName,
            property: 'position',
            value: newPos
        });
        eventChannelHub.publish(DEBUG_SCENE_CHANNELS.LIGHT_PROPERTY_FEEDBACK, {
            name: lightName,
            property: 'position',
            value: newPos
        });
    }, [lightName]);

    const handleTargetPositionChange = useCallback((newPos) => {
        setTargetPos(newPos);
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
            name: lightName,
            property: 'target',
            value: newPos
        });
        eventChannelHub.publish(DEBUG_SCENE_CHANNELS.LIGHT_PROPERTY_FEEDBACK, {
            name: lightName,
            property: 'target',
            value: newPos
        });
    }, [lightName]);

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