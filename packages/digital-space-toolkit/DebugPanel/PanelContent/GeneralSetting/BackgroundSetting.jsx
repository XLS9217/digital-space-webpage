import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock.jsx';
import ColorPicker from '../../CommonComponent/ColorPicker.jsx';
import CheckBox from '../../CommonComponent/CheckBox.jsx';
import { eventChannelHub, CONTROL_CHANNELS } from '../../../EventChannelHub';

export default function BackgroundSetting({ onSerializedUpdate, initialBackground }) {
    const [backgroundColor, setBackgroundColor] = useState(initialBackground?.color || '#000000');
    const [backgroundEnabled, setBackgroundEnabled] = useState(initialBackground?.enabled !== undefined ? initialBackground.enabled : true);

    // Sync from props when initialBackground changes externally
    useEffect(() => {
        if (initialBackground) {
            if (initialBackground.color) {
                setBackgroundColor(initialBackground.color);
            }
            if (initialBackground.enabled !== undefined) {
                setBackgroundEnabled(initialBackground.enabled);
            }
        }
    }, [initialBackground]);

    // Notify parent whenever background settings change
    useEffect(() => {
        if (onSerializedUpdate) {
            onSerializedUpdate({
                color: backgroundColor,
                enabled: backgroundEnabled
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backgroundColor, backgroundEnabled]);

    // Apply background to scene whenever settings change (including initial load)
    useEffect(() => {
        eventChannelHub.publish(CONTROL_CHANNELS.SCENE_BACKGROUND_UPDATE, {
            color: backgroundColor,
            enabled: backgroundEnabled
        });
    }, [backgroundColor, backgroundEnabled]);

    const handleColorChange = useCallback((newColor) => {
        // Publish to 3D engine to update scene background
        eventChannelHub.publish(CONTROL_CHANNELS.SCENE_BACKGROUND_UPDATE, {
            color: newColor,
            enabled: backgroundEnabled
        });
        // Update local state
        setBackgroundColor(newColor);
    }, [backgroundEnabled]);

    const handleEnabledChange = useCallback((newEnabled) => {
        // Publish to 3D engine to toggle background
        eventChannelHub.publish(CONTROL_CHANNELS.SCENE_BACKGROUND_UPDATE, {
            color: backgroundColor,
            enabled: newEnabled
        });
        // Update local state
        setBackgroundEnabled(newEnabled);
    }, [backgroundColor]);

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
        </DebugBlock>
    );
}