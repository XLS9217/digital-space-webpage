import { useGLTF, Html } from '@react-three/drei'
import { useEffect, useState } from 'react';
import { eventChannelHub, DEBUG_CHANNELS } from './EventChannelHub';

function BaseModel({ url, name, scale = 1 }) {
    const { scene } = useGLTF(url)
    return <primitive
        object={scene}
        name={name}
        scale={scale}
    />
}

function FrameModel({ url, name, scale = 1 }) {
    const { scene } = useGLTF(url)
    console.log(scene)
    // Get child models from the root group's children
    const children = scene.children[0]?.children || []
    const [hoveredIndex, setHoveredIndex] = useState(null)

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

    return (
        <group>
            <primitive
                object={scene}
                name={name}
                scale={scale}
            />
            {children.map((child, index) => (
                <Html key={index} position={child.position}>
                    <div
                        style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'auto',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {child.name}
                    </div>
                </Html>
            ))}
        </group>
    )
}

export default function DigitalScene({ scene_data }) {
    useEffect(() => {
        if (scene_data) {
            eventChannelHub.publish(DEBUG_CHANNELS.INTERNAL_DEBUG_SCENE, scene_data);
        }
    }, [scene_data]);

    if(!scene_data)
    {
        console.log("no scene data yet")
        return null;
    }

    const models = scene_data.models;

    return (
        <group>
            {models.map((model, index) => {
                if (model.type === 'frame') {
                    return <FrameModel key={index} url={model.url} name={model.name} scale={model.scale} />
                } else {
                    return <BaseModel key={index} url={model.url} name={model.name} scale={model.scale} />
                }
            })}
        </group>
    )
}