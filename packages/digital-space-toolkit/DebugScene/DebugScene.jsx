import React, { useEffect, useState } from 'react';
import { eventChannelHub, CONTROL_CHANNELS } from '../EventChannelHub';
import sceneObjectRegistry from '../DigitalScene/SceneObjectRegistry';
import DirectionalLightHelper from './DirectionalLightHelper';

export default function DebugScene() {
    const [helpers, setHelpers] = useState({}); // uuid → threeObject

    useEffect(() => {
        const handleLightHelperToggle = ({ uuid, showHelper }) => {
            const light = sceneObjectRegistry.getThreeObject(uuid);
            if (!light || light.type !== 'DirectionalLight') {
                console.warn(`Light uuid "${uuid}" not found or not a DirectionalLight`);
                return;
            }

            setHelpers(prev => {
                if (showHelper) {
                    return { ...prev, [uuid]: light };
                } else {
                    const next = { ...prev };
                    delete next[uuid];
                    return next;
                }
            });
        };

        eventChannelHub.subscribe(CONTROL_CHANNELS.LIGHT_HELPER_TOGGLE, handleLightHelperToggle);

        return () => {
            eventChannelHub.unsubscribe(CONTROL_CHANNELS.LIGHT_HELPER_TOGGLE, handleLightHelperToggle);
        };
    }, []);

    return (
        <>
            {Object.entries(helpers).map(([uuid, light]) => (
                <DirectionalLightHelper key={uuid} light={light} uuid={uuid} />
            ))}
        </>
    );
}
