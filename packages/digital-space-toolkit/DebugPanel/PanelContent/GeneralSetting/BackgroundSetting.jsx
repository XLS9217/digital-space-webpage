import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock.jsx';
import ColorPicker from '../../CommonComponent/ColorPicker.jsx';
import CheckBox from '../../CommonComponent/CheckBox.jsx';
import MinMaxHandle from '../../CommonComponent/MinMaxHandle.jsx';
import { eventChannelHub, CONTROL_CHANNELS } from '../../../EventChannelHub';

export default function BackgroundSetting({ onSerializedUpdate, initialBackground }) {
    const [backgroundColor, setBackgroundColor] = useState(initialBackground?.color || '#000000');
    const [backgroundEnabled, setBackgroundEnabled] = useState(initialBackground?.enabled !== undefined ? initialBackground.enabled : true);
    const [fogEnabled, setFogEnabled] = useState(initialBackground?.fog?.enabled || false);
    const [fogNear, setFogNear] = useState(initialBackground?.fog?.near || 10);
    const [fogFar, setFogFar] = useState(initialBackground?.fog?.far || 100);

    // Sync from props when initialBackground changes externally
    useEffect(() => {
        if (initialBackground) {
            if (initialBackground.color) {
                setBackgroundColor(initialBackground.color);
            }
            if (initialBackground.enabled !== undefined) {
                setBackgroundEnabled(initialBackground.enabled);
            }
            if (initialBackground.fog) {
                if (initialBackground.fog.enabled !== undefined) {
                    setFogEnabled(initialBackground.fog.enabled);
                }
                if (initialBackground.fog.near !== undefined) {
                    setFogNear(initialBackground.fog.near);
                }
                if (initialBackground.fog.far !== undefined) {
                    setFogFar(initialBackground.fog.far);
                }
            }
        }
    }, [initialBackground]);

    // Notify parent whenever background settings change
    useEffect(() => {
        if (onSerializedUpdate) {
            onSerializedUpdate({
                color: backgroundColor,
                enabled: backgroundEnabled,
                fog: {
                    enabled: fogEnabled,
                    near: fogNear,
                    far: fogFar
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backgroundColor, backgroundEnabled, fogEnabled, fogNear, fogFar]);

    // Apply background to scene whenever settings change (including initial load)
    useEffect(() => {
        eventChannelHub.publish(CONTROL_CHANNELS.SCENE_BACKGROUND_UPDATE, {
            color: backgroundColor,
            enabled: backgroundEnabled,
            fog: {
                enabled: fogEnabled,
                near: fogNear,
                far: fogFar
            }
        });
    }, [backgroundColor, backgroundEnabled, fogEnabled, fogNear, fogFar]);

    const handleColorChange = useCallback((newColor) => {
        eventChannelHub.publish(CONTROL_CHANNELS.SCENE_BACKGROUND_UPDATE, {
            color: newColor,
            enabled: backgroundEnabled,
            fog: { enabled: fogEnabled, near: fogNear, far: fogFar }
        });
        setBackgroundColor(newColor);
    }, [backgroundEnabled, fogEnabled, fogNear, fogFar]);

    const handleEnabledChange = useCallback((newEnabled) => {
        eventChannelHub.publish(CONTROL_CHANNELS.SCENE_BACKGROUND_UPDATE, {
            color: backgroundColor,
            enabled: newEnabled,
            fog: { enabled: fogEnabled, near: fogNear, far: fogFar }
        });
        setBackgroundEnabled(newEnabled);
    }, [backgroundColor, fogEnabled, fogNear, fogFar]);

    const handleFogEnabledChange = useCallback((newEnabled) => {
        setFogEnabled(newEnabled);
    }, []);

    const handleFogRangeChange = useCallback(({ min, max }) => {
        setFogNear(min);
        setFogFar(max);
    }, []);

    return (
        <DebugBlock
            title="Background"
            alwaysExpanded={true}
        >
            <ColorPicker
                label="Color"
                value={backgroundColor}
                editable={true}
                onValueChange={handleColorChange}
            />
            <CheckBox
                label="Enabled"
                checked={backgroundEnabled}
                onChange={handleEnabledChange}
            />
            <CheckBox
                label="Fog"
                checked={fogEnabled}
                onChange={handleFogEnabledChange}
            />
            {fogEnabled && (
                <MinMaxHandle
                    label="Distance"
                    minValue={fogNear}
                    maxValue={fogFar}
                    rangeMin={0}
                    rangeMax={1000}
                    step={1}
                    editable={true}
                    onValueChange={handleFogRangeChange}
                />
            )}
        </DebugBlock>
    );
}