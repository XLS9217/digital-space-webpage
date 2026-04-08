import { useGLTF, Html } from '@react-three/drei'
import React from 'react'//for webpack consistency,
import { useEffect, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import tagRegistry from '../../TagRegistry.js'
import sceneObjectRegistry from '../SceneObjectRegistry'
import { eventChannelHub, CONTROL_CHANNELS, INFO_CHANNELS } from '../../EventChannelHub'

function DefaultTag({ name }) {
    return <span style={{
        background: '#999',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'nowrap'
    }}>{name}</span>
}

tagRegistry.register('DEFAULT', DefaultTag , )

export function parseTagName(rawName) {
    if (!rawName) {
        return { prefix: 'DEFAULT', tagName: '' }
    }

    const parts = rawName.split('_')

    if (parts.length < 2) {
        return { prefix: 'DEFAULT', tagName: rawName }
    }

    const [prefix, ...rest] = parts
    return { prefix, tagName: rest.join('_') }
}

/*
    Assumption
    the prefix is separated by _ at front, processed in parseTagName
 */
export default function FrameModel({ url, name, scale = 1, position = {x:0, y:0, z:0}, rotation = {x:0, y:0, z:0}, modelData }) {
    const { scene } = useGLTF(url)
    const children = scene.children[0]?.children || []
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const [visible, setVisible] = useState(true)
    const groupRef = useRef()
    const { camera } = useThree()
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const tagRefs = useRef([])
    const [tagScales, setTagScales] = useState([])
    const [tagZIndices, setTagZIndices] = useState([])

    if (name) {
        scene.name = name
    }

    // Register in registry once scene is available
    useEffect(() => {
        if (!groupRef.current) return;
        const uuid = groupRef.current.uuid;
        sceneObjectRegistry.register(uuid, 'model', modelData || { name, url, scale, position, rotation }, groupRef.current);
        return () => sceneObjectRegistry.unregister(uuid);
    }, [groupRef]);

    const posArr = [position.x || 0, position.y || 0, position.z || 0];
    const rotArr = [rotation.x || 0, rotation.y || 0, rotation.z || 0];
    const scaleArr = typeof scale === 'object' 
        ? [scale.x || 1, scale.y || 1, scale.z || 1] 
        : [scale, scale, scale];

    useEffect(() => {
        // Hide all children initially
        children.forEach(child => {
            child.visible = false
        })
    }, [children])


    useEffect(() => {
        // Update visibility based on hover
        children.forEach((child, index) => {
            child.visible = hoveredIndex === index
        })
    }, [hoveredIndex, children])

    // Subscribe to visibility changes from event channel
    useEffect(() => {
        if (!groupRef.current) return;
        const uuid = groupRef.current.uuid;

        const handleVisibilityUpdate = ({ uuid: eventUuid, property, value }) => {
            if (eventUuid === uuid && property === 'visible') {
                setVisible(value);
            }
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.OBJECT_UPDATE, handleVisibilityUpdate);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.OBJECT_UPDATE, handleVisibilityUpdate);
        };
    }, [groupRef]);

    // Calculate tag scales and z-indices based on distance and mouse proximity
    useFrame(() => {
        if (!groupRef.current) return;

        const tagData = children.map((child, index) => {
            const tagRef = tagRefs.current[index];
            if (!tagRef) return { scale: 1, distance: Infinity };

            const entry = tagRegistry.get(parseTagName(child.name).prefix) || tagRegistry.get('DEFAULT');
            const distanceFactor = entry?.distanceFactor || 10;
            const minSize = entry?.minSize;
            const maxSize = entry?.maxSize;
            const magnifyDistance = entry?.magnifyDistance;

            // Calculate distance-based scale
            const objectPos = new Vector3().setFromMatrixPosition(groupRef.current.matrixWorld).add(child.position);
            const cameraPos = new Vector3().setFromMatrixPosition(camera.matrixWorld);
            const dist = objectPos.distanceTo(cameraPos);
            const vFOV = camera.fov * Math.PI / 180;
            const scaleFOV = 2 * Math.tan(vFOV / 2) * dist;
            const baseScale = (1 / scaleFOV) * distanceFactor;
            const clampedBaseScale = minSize !== undefined && maxSize !== undefined
                ? Math.max(minSize, Math.min(maxSize, baseScale))
                : minSize !== undefined
                    ? Math.max(minSize, baseScale)
                    : maxSize !== undefined
                        ? Math.min(maxSize, baseScale)
                        : baseScale;

            // Calculate mouse distance for z-index
            const rect = tagRef.getBoundingClientRect();
            const tagCenterX = rect.left + rect.width / 2;
            const tagCenterY = rect.top + rect.height / 2;
            const dx = mousePos.x - tagCenterX;
            const dy = mousePos.y - tagCenterY;
            const mouseDistance = Math.sqrt(dx * dx + dy * dy);

            // Calculate mouse proximity magnification
            let finalSize = clampedBaseScale;
            if (magnifyDistance && mouseDistance < magnifyDistance) {
                const t = 1 - mouseDistance / magnifyDistance;
                const targetMaxSize = maxSize !== undefined ? maxSize : 1;
                finalSize = clampedBaseScale + (targetMaxSize - clampedBaseScale) * t;
            }

            return { scale: finalSize, distance: mouseDistance };
        });

        // Calculate z-indices based on mouse distance (closer = higher z-index)
        const sortedIndices = tagData
            .map((data, index) => ({ index, distance: data.distance }))
            .sort((a, b) => b.distance - a.distance); // Sort descending (farthest first)

        const newZIndices = new Array(children.length);
        sortedIndices.forEach((item, rank) => {
            newZIndices[item.index] = rank * 1000; // Multiply by 100 for larger separation
        });

        setTagScales(tagData.map(d => d.scale));
        setTagZIndices(newZIndices);
    });

    // Track mouse position
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <group ref={groupRef} name={name} position={posArr} rotation={rotArr}>
            <primitive
                object={scene}
                scale={scaleArr}
            />
            {visible && children.map((child, index) => {
                const { prefix, tagName } = parseTagName(child.name)
                const entry = tagRegistry.get(prefix) || tagRegistry.get('DEFAULT')
                const TagComponent = entry?.component
                const currentScale = tagScales[index] || 1
                const currentZIndex = tagZIndices[index] !== undefined ? tagZIndices[index] : 0

                return (
                    <Html
                        zIndexRange={[currentZIndex, currentZIndex]}
                        key={index}
                        position={child.position}
                        center
                    >
                        <div
                            ref={el => tagRefs.current[index] = el}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                transform: `scale(${currentScale})`,
                                transition: 'transform 0.1s ease-out'
                            }}
                        >
                            <TagComponent name={tagName} />
                        </div>
                    </Html>
                )
            })}
        </group>
    )
}