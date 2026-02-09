import { useGLTF } from '@react-three/drei'

export default function BaseModel({ url, name, scale = 1 }) {
    const { scene } = useGLTF(url)
    return <primitive
        object={scene}
        name={name}
        scale={scale}
    />
}