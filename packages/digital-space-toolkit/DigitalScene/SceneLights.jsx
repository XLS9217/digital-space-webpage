import React, { useRef, useEffect } from 'react'//for webpack consistency,
import { useThree } from '@react-three/fiber';
import { LIGHT_TYPE } from '../SceneTypeEnum';

function DirectionalLightWrapper({ name, position, target, intensity, color }) {
    const lightRef = useRef();
    const { scene } = useThree();

    useEffect(() => {
        if (lightRef.current) {
            if (target) {
                lightRef.current.target.position.set(target[0], target[1], target[2]);
            }
            scene.add(lightRef.current.target);
            return () => {
                scene.remove(lightRef.current.target);
            };
        }
    }, [target, scene]);

    return (
        <directionalLight
            ref={lightRef}
            name={name}
            position={position}
            intensity={intensity}
            color={color}
            castShadow
        />
    );
}

export default function SceneLights({ lights = [] }) {
    if (!lights || lights.length === 0) {
        console.warn("No lights in scene, adding ambient light")
        return (
            <>
                <ambientLight intensity={0.5} />
            </>
        )
    }

    return (
        <>
            {lights.map((light, index) => {
                const position = light.position
                    ? [light.position.x, light.position.y, light.position.z]
                    : undefined;
                const target = light.target
                    ? [light.target.x, light.target.y, light.target.z]
                    : undefined;
                const key = light.name || `light-${index}`;

                switch (light.type) {
                    case LIGHT_TYPE.AMBIENT:
                        return <ambientLight key={key} name={light.name} intensity={light.intensity} color={light.color} />;
                    case LIGHT_TYPE.DIRECTIONAL:
                        return (
                            <DirectionalLightWrapper
                                key={key}
                                name={light.name}
                                position={position}
                                target={target}
                                intensity={light.intensity}
                                color={light.color}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    )
}