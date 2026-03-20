import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { eventChannelHub, CONTROL_CHANNELS } from '../EventChannelHub';
import DirectionalLightHelper from './DirectionalLightHelper';

export default function DebugScene() {
    const { scene } = useThree();
    const [helpers, setHelpers] = useState({});

    useEffect(() => {
        const handleLightHelperToggle = ({ name, showHelper }) => {
            const light = scene.getObjectByName(name);
            if (!light || light.type !== 'DirectionalLight') {
                console.warn(`Light "${name}" not found or not a DirectionalLight`);
                return;
            }

            setHelpers(prev => {
                if (showHelper) {
                    return { ...prev, [name]: light };
                } else {
                    const next = { ...prev };
                    delete next[name];
                    return next;
                }
            });
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.LIGHT_HELPER_TOGGLE, handleLightHelperToggle);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.LIGHT_HELPER_TOGGLE, handleLightHelperToggle);
        };
    }, [scene]);

    return (
        <>
            {Object.entries(helpers).map(([name, light]) => (
                <DirectionalLightHelper key={name} light={light} lightName={name} />
            ))}
        </>
    );
}