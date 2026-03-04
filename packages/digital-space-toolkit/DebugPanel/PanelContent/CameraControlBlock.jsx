import React, { useEffect, useState } from 'react';
import { eventChannelHub, INFO_CHANNELS, CONTROL_CHANNELS } from "../../EventChannelHub";
import DebugBlock from "../CommonComponent/DebugBlock";
import CoordDisplayer from "../CommonComponent/CoordDisplayer";
import BarHandle from "../CommonComponent/BarHandle";

const FLOAT_PRECISION = 3;

export default function CameraControlBlock({ onSerializedUpdate }) {
    const [controlInfo, setControlInfo] = useState(null);
    const [controlSettings, setControlSettings] = useState({
        minDistance: 1,
        maxDistance: 100,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI
    });

    const handleSettingChange = (property) => (newValue) => {
        setControlSettings(prev => ({
            ...prev,
            [property]: newValue
        }));

        // Publish to update the controls
        eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
            [property]: newValue
        });
    };

    useEffect(() => {
        const handleControlInfo = (data) => {
            setControlInfo(data);

            if (onSerializedUpdate) {
                const serialized = data ? {
                    type: data.type,
                    position: {
                        x: parseFloat(data.position.x.toFixed(FLOAT_PRECISION)),
                        y: parseFloat(data.position.y.toFixed(FLOAT_PRECISION)),
                        z: parseFloat(data.position.z.toFixed(FLOAT_PRECISION))
                    },
                    ...(data.target && {
                        target: {
                            x: parseFloat(data.target.x.toFixed(FLOAT_PRECISION)),
                            y: parseFloat(data.target.y.toFixed(FLOAT_PRECISION)),
                            z: parseFloat(data.target.z.toFixed(FLOAT_PRECISION))
                        }
                    }),
                    ...(data.rotation && {
                        rotation: {
                            x: parseFloat(data.rotation.x.toFixed(FLOAT_PRECISION)),
                            y: parseFloat(data.rotation.y.toFixed(FLOAT_PRECISION)),
                            z: parseFloat(data.rotation.z.toFixed(FLOAT_PRECISION))
                        }
                    })
                } : null;
                onSerializedUpdate(serialized);
            }
        };

        eventChannelHub.subscribe(INFO_CHANNELS.CAMERA_CONTROL_INFO, handleControlInfo);
        return () => {
            eventChannelHub.unsubscribe(INFO_CHANNELS.CAMERA_CONTROL_INFO, handleControlInfo);
        };
    }, [onSerializedUpdate]);

    if (!controlInfo) return <span>No data</span>;

    const { type, position, target, rotation } = controlInfo;

    return (
        <DebugBlock title="Control Info" type={type} initialExpanded={true}>
            <CoordDisplayer label="Init Pos" value={position} />
            {target && <CoordDisplayer label="Target" value={target} />}
            {rotation && <CoordDisplayer label="Rot" value={rotation} />}

            {type === 'orbit' && (
                <>
                    <BarHandle
                        label="Min Zoom"
                        value={controlSettings.minDistance}
                        min={0.1}
                        max={50}
                        step={0.1}
                        editable={true}
                        onValueChange={handleSettingChange('minDistance')}
                    />
                    <BarHandle
                        label="Max Zoom"
                        value={controlSettings.maxDistance}
                        min={10}
                        max={200}
                        step={1}
                        editable={true}
                        onValueChange={handleSettingChange('maxDistance')}
                    />
                    <BarHandle
                        label="Min Angle"
                        value={controlSettings.minPolarAngle}
                        min={0}
                        max={Math.PI}
                        step={0.01}
                        editable={true}
                        onValueChange={handleSettingChange('minPolarAngle')}
                    />
                    <BarHandle
                        label="Max Angle"
                        value={controlSettings.maxPolarAngle}
                        min={0}
                        max={Math.PI}
                        step={0.01}
                        editable={true}
                        onValueChange={handleSettingChange('maxPolarAngle')}
                    />
                </>
            )}
        </DebugBlock>
    );
}
