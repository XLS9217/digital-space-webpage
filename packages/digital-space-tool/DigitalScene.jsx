import { useGLTF, Html } from '@react-three/drei'
import { useEffect, useState } from 'react';
import { eventChannelHub, DEBUG_CHANNELS } from './EventChannelHub';
import tagRegistry from './TagRegistry'

function DefaultTag({ name }) {
    return <span>{name}</span>
}

tagRegistry.register('DEFAULT', DefaultTag)

function parseTagName(rawName) {
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

function BaseModel({ url, name, scale = 1 }) {
    const { scene } = useGLTF(url)
    return <primitive
        object={scene}
        name={name}
        scale={scale}
    />
}

/*
    Assumption
    the prefix is separated by _ at front, processed in parseTagName
 */
function FrameModel({ url, name, scale = 1 }) {
    const { scene } = useGLTF(url)
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
            {children.map((child, index) => {
                const { prefix, tagName } = parseTagName(child.name)
                // console.log(tagName)
                const entry = tagRegistry.get(prefix) || tagRegistry.get('DEFAULT')
                const TagComponent = entry?.component
                const distanceFactor = entry?.distanceFactor

                return (
                    <Html
                        key={index}
                        position={child.position}
                        center
                        distanceFactor={distanceFactor}
                    >
                        <div
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <TagComponent name={tagName} />
                        </div>
                    </Html>
                )
            })}
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