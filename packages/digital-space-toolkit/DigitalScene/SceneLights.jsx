import React, { useRef, useEffect } from 'react'//for webpack consistency,
import { useThree } from '@react-three/fiber';
import { LIGHT_TYPE } from '../SceneTypeEnum';
import sceneObjectRegistry from './SceneObjectRegistry';

function DirectionalLightWrapper({ name, position, target, intensity, color, lightData }) {
    const lightRef = useRef();
    const { scene } = useThree();

    useEffect(() => {
        if (!lightRef.current) {
            return undefined;
        }

        const light = lightRef.current;

        if (target) {
            light.target.position.set(target[0], target[1], target[2]);
        }
        scene.add(light.target);

        // Register in registry
        const uuid = light.uuid;
        sceneObjectRegistry.register(uuid, 'light', lightData, light);

        return () => {
            scene.remove(light.target);
            sceneObjectRegistry.unregister(uuid);
        };
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

function AmbientLightWrapper({ name, intensity, color, lightData }) {
    const lightRef = useRef();

    useEffect(() => {
        if (lightRef.current) {
            const uuid = lightRef.current.uuid;
            sceneObjectRegistry.register(uuid, 'light', lightData, lightRef.current);
            return () => sceneObjectRegistry.unregister(uuid);
        }
    }, []);

    return <ambientLight ref={lightRef} name={name} intensity={intensity} color={color} />;
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
                        return <AmbientLightWrapper key={key} name={light.name} intensity={light.intensity} color={light.color} lightData={light} />;
                    case LIGHT_TYPE.DIRECTIONAL:
                        return (
                            <DirectionalLightWrapper
                                key={key}
                                name={light.name}
                                position={position}
                                target={target}
                                intensity={light.intensity}
                                color={light.color}
                                lightData={light}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    )
}