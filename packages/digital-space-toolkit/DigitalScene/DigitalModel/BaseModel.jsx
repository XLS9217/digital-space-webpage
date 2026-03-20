import React, { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import sceneObjectRegistry from '../SceneObjectRegistry'

export default function BaseModel({ url, name, scale = 1, position = {x:0, y:0, z:0}, rotation = {x:0, y:0, z:0}, modelData }) {
    const { scene } = useGLTF(url)

    // Register in registry once scene is available
    useEffect(() => {
        const uuid = scene.uuid;
        sceneObjectRegistry.register(uuid, 'model', modelData || { name, url, scale, position, rotation }, scene);
        return () => sceneObjectRegistry.unregister(uuid);
    }, [scene]);

    const posArr = [position.x || 0, position.y || 0, position.z || 0];
    const rotArr = [rotation.x || 0, rotation.y || 0, rotation.z || 0];
    const scaleArr = typeof scale === 'object'
        ? [scale.x || 1, scale.y || 1, scale.z || 1]
        : [scale, scale, scale];

    return <primitive
        object={scene}
        name={name}
        scale={scaleArr}
        position={posArr}
        rotation={rotArr}
    />
}