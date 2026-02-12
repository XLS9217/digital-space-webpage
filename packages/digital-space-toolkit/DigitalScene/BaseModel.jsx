import { useGLTF } from '@react-three/drei'

export default function BaseModel({ url, name, scale = 1, position = {x:0, y:0, z:0}, rotation = {x:0, y:0, z:0} }) {
    const { scene } = useGLTF(url)
    console.log(scene)

    // Convert objects to arrays for R3F if needed, 
    // although R3F props accept objects {x,y,z}, 
    // but standardizing is safer.
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