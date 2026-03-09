import React from 'react'//for webpack consistency,
import { LIGHT_TYPE } from '../SceneTypeEnum';

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
                const key = light.name || `light-${index}`;

                switch (light.type) {
                    case LIGHT_TYPE.AMBIENT:
                        return <ambientLight key={key} name={light.name} intensity={light.intensity} color={light.color} />;
                    case LIGHT_TYPE.DIRECTIONAL:
                        return (
                            <directionalLight
                                key={key}
                                name={light.name}
                                position={position}
                                intensity={light.intensity}
                                color={light.color}
                                castShadow
                            />
                        );
                    case LIGHT_TYPE.POINT:
                        return (
                            <pointLight
                                key={key}
                                name={light.name}
                                position={position}
                                intensity={light.intensity}
                                color={light.color}
                                castShadow
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    )
}