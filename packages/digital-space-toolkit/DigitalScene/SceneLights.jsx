import React, { useRef, useEffect } from 'react'//for webpack consistency,
import { useThree } from '@react-three/fiber';
import { LIGHT_TYPE } from '../SceneTypeEnum';
import sceneObjectRegistry from './SceneObjectRegistry';

function DirectionalLightWrapper({ name, intensity, color, advanced = {}, lightData }) {
    const lightRef = useRef();
    const { scene } = useThree();

    // Initialize all local variables from props once
    const [lightConfig] = React.useState(() => {
        const position = advanced.position
            ? [advanced.position.x, advanced.position.y, advanced.position.z]
            : undefined;
        const target = advanced.target
            ? [advanced.target.x, advanced.target.y, advanced.target.z]
            : undefined;

        // Calculate distance between light and target for shadow camera far plane
        let calculatedFar = 200;
        if (position && target) {
            const dx = position[0] - target[0];
            const dy = position[1] - target[1];
            const dz = position[2] - target[2];
            calculatedFar = Math.sqrt(dx * dx + dy * dy + dz * dz);
        }

        return {
            position,
            target,
            shadowCameraFar: advanced.shadowCameraFar ?? calculatedFar,
            castShadow: advanced.castShadow ?? true,
            shadowMapSize: advanced.shadowMapSize ?? [1024, 1024],
            shadowCameraLeft: advanced.shadowCameraLeft ?? -50,
            shadowCameraRight: advanced.shadowCameraRight ?? 50,
            shadowCameraTop: advanced.shadowCameraTop ?? 50,
            shadowCameraBottom: advanced.shadowCameraBottom ?? -50,
            shadowBias: advanced.shadowBias ?? -0.001,
            shadowNormalBias: advanced.shadowNormalBias ?? 0.05,
            shadowRadius: advanced.shadowRadius ?? 10
        };
    });

    useEffect(() => {
        if (!lightRef.current) {
            return undefined;
        }

        const light = lightRef.current;

        if (lightConfig.target) {
            light.target.position.set(lightConfig.target[0], lightConfig.target[1], lightConfig.target[2]);
        }
        scene.add(light.target);

        // Register in registry
        const uuid = light.uuid;
        sceneObjectRegistry.register(uuid, 'light', lightData, light);

        return () => {
            scene.remove(light.target);
            sceneObjectRegistry.unregister(uuid);
        };
    }, []);

    return (
        <directionalLight
            ref={lightRef}
            name={name}
            position={lightConfig.position}
            intensity={intensity}
            color={color}
            castShadow={lightConfig.castShadow}
            shadow-mapSize={lightConfig.shadowMapSize}
            shadow-camera-far={lightConfig.shadowCameraFar}
            shadow-camera-left={lightConfig.shadowCameraLeft}
            shadow-camera-right={lightConfig.shadowCameraRight}
            shadow-camera-top={lightConfig.shadowCameraTop}
            shadow-camera-bottom={lightConfig.shadowCameraBottom}
            shadow-bias={lightConfig.shadowBias}
            shadow-normalBias={lightConfig.shadowNormalBias}
            shadow-radius={lightConfig.shadowRadius}
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
                const key = light.name || `light-${index}`;

                switch (light.type) {
                    case LIGHT_TYPE.AMBIENT:
                        return <AmbientLightWrapper key={key} name={light.name} intensity={light.intensity} color={light.color} lightData={light} />;
                    case LIGHT_TYPE.DIRECTIONAL:
                        return (
                            <DirectionalLightWrapper
                                key={key}
                                name={light.name}
                                intensity={light.intensity}
                                color={light.color}
                                advanced={light.advanced}
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