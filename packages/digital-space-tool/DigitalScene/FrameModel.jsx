import { useGLTF, Html } from '@react-three/drei'
import { useEffect, useState } from 'react';
import tagRegistry from '../TagRegistry'

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

/*
    Assumption
    the prefix is separated by _ at front, processed in parseTagName
 */
export default function FrameModel({ url, name, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) {
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
        <group position={position} rotation={rotation}>
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
                        zIndexRange={[0, 100]}
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