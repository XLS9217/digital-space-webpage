import React, { useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { eventChannelHub, DEBUG_SCENE_CHANNELS } from '../EventChannelHub';

const AXIS_LENGTH = 2;
const CONE_HEIGHT = 0.3;
const CONE_RADIUS = 0.1;
const SCREEN_SCALE_FACTOR = 0.05;

const AXES = [
    { dir: [1, 0, 0], color: 0xff0000, name: 'x' },
    { dir: [0, 1, 0], color: 0x00ff00, name: 'y' },
    { dir: [0, 0, 1], color: 0x0000ff, name: 'z' },
];

export default function GizmoHelper({ position, onPositionChange }) {
    const { camera, gl } = useThree();
    const dragRef = useRef(null);
    const groupRef = useRef();

    // Keep gizmo constant size in screen space
    useFrame(() => {
        if (groupRef.current) {
            const pos = new THREE.Vector3(position.x, position.y, position.z);
            const dist = camera.position.distanceTo(pos);
            const scale = dist * SCREEN_SCALE_FACTOR;
            groupRef.current.scale.setScalar(scale);
        }
    });

    const handlePointerMove = useCallback((e) => {
        if (!dragRef.current) return;

        const { axisVec, plane, startHit, startPos } = dragRef.current;

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2(
            (e.clientX / gl.domElement.clientWidth) * 2 - 1,
            -(e.clientY / gl.domElement.clientHeight) * 2 + 1
        );
        raycaster.setFromCamera(pointer, camera);
        const currentHit = new THREE.Vector3();
        if (!raycaster.ray.intersectPlane(plane, currentHit)) return;

        // Project delta onto the constrained axis
        const delta = currentHit.sub(startHit);
        const projected = axisVec.clone().multiplyScalar(delta.dot(axisVec));

        const newPos = {
            x: Math.round((startPos.x + projected.x) * 100) / 100,
            y: Math.round((startPos.y + projected.y) * 100) / 100,
            z: Math.round((startPos.z + projected.z) * 100) / 100,
        };

        onPositionChange(newPos);
    }, [camera, gl, onPositionChange]);

    const handlePointerUp = useCallback(() => {
        if (!dragRef.current) return;
        // Re-enable orbit controls
        eventChannelHub.publish(DEBUG_SCENE_CHANNELS.CONTROLS_ENABLE, { enabled: true });
        dragRef.current = null;
    }, []);

    // Attach canvas-level event listeners for move and up
    useEffect(() => {
        const canvas = gl.domElement;
        const moveHandler = (e) => {
            if (dragRef.current) {
                e.preventDefault();
                handlePointerMove(e);
            }
        };
        const upHandler = () => {
            if (dragRef.current) {
                handlePointerUp();
            }
        };

        canvas.addEventListener('pointermove', moveHandler);
        canvas.addEventListener('pointerup', upHandler);
        canvas.addEventListener('pointercancel', upHandler);

        return () => {
            canvas.removeEventListener('pointermove', moveHandler);
            canvas.removeEventListener('pointerup', upHandler);
            canvas.removeEventListener('pointercancel', upHandler);
        };
    }, [gl, handlePointerMove, handlePointerUp]);

    const handlePointerDown = useCallback((axis) => (e) => {
        e.stopPropagation();

        // Disable orbit controls during drag
        eventChannelHub.publish(DEBUG_SCENE_CHANNELS.CONTROLS_ENABLE, { enabled: false });

        const axisVec = new THREE.Vector3(...AXES.find(a => a.name === axis).dir);
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);

        // Build a plane containing the drag axis, best aligned to camera view
        let planeNormal = new THREE.Vector3().crossVectors(axisVec, camDir);
        if (planeNormal.lengthSq() < 0.001) {
            planeNormal.set(0, 1, 0);
            if (Math.abs(axisVec.dot(planeNormal)) > 0.9) planeNormal.set(1, 0, 0);
        }
        planeNormal.crossVectors(planeNormal, axisVec).normalize();

        const origin = new THREE.Vector3(position.x, position.y, position.z);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, origin);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2(
            (e.clientX / gl.domElement.clientWidth) * 2 - 1,
            -(e.clientY / gl.domElement.clientHeight) * 2 + 1
        );
        raycaster.setFromCamera(pointer, camera);
        const startHit = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, startHit);

        dragRef.current = {
            axis,
            axisVec,
            plane,
            startHit,
            startPos: { ...position }
        };
    }, [position, camera, gl]);

    return (
        <group ref={groupRef} position={[position.x, position.y, position.z]}>
            {AXES.map(({ dir, color, name }) => {
                const end = [dir[0] * AXIS_LENGTH, dir[1] * AXIS_LENGTH, dir[2] * AXIS_LENGTH];
                const quat = new THREE.Quaternion();
                quat.setFromUnitVectors(
                    new THREE.Vector3(0, 1, 0),
                    new THREE.Vector3(...dir)
                );
                const euler = new THREE.Euler().setFromQuaternion(quat);

                return (
                    <group key={name}>
                        {/* Axis line */}
                        <line>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    array={new Float32Array([0, 0, 0, ...end])}
                                    count={2}
                                    itemSize={3}
                                />
                            </bufferGeometry>
                            <lineBasicMaterial color={color} />
                        </line>
                        {/* Cone arrow */}
                        <mesh
                            position={end}
                            rotation={[euler.x, euler.y, euler.z]}
                            onPointerDown={handlePointerDown(name)}
                        >
                            <coneGeometry args={[CONE_RADIUS * 2, CONE_HEIGHT * 2, 8]} />
                            <meshBasicMaterial color={color} />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
}