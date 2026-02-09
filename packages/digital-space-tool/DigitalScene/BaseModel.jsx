import { useGLTF } from '@react-three/drei'

export default function BaseModel({ url, name, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }) {
    const { scene } = useGLTF(url)
    return <primitive
        object={scene}
        name={name}
        scale={scale}
        position={position}
        rotation={rotation}
    />
}