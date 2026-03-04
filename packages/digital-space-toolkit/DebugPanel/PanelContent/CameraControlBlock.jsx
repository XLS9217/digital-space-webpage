import React, { useEffect, useState } from 'react';
import { eventChannelHub, INFO_CHANNELS, CONTROL_CHANNELS } from "../../EventChannelHub";
import DebugBlock from "../CommonComponent/DebugBlock";
import CoordDisplayer from "../CommonComponent/CoordDisplayer";
import MinMaxHandle from "../CommonComponent/MinMaxHandle";

const FLOAT_PRECISION = 3;

export default function CameraControlBlock({ onSerializedUpdate }) {
    const [controlInfo, setControlInfo] = useState(null);
    const [controlSettings, setControlSettings] = useState({
        minDistance: 1,
        maxDistance: 100,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI
    });

    const handleZoomChange = (values) => {
        setControlSettings(prev => ({
            ...prev,
            minDistance: values.min,
            maxDistance: values.max
        }));

        // Publish to update the controls
        eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
            minDistance: values.min,
            maxDistance: values.max
        });
    };

    const handleAngleChange = (values) => {
        setControlSettings(prev => ({
            ...prev,
            minPolarAngle: values.min,
            maxPolarAngle: values.max
        }));

        // Publish to update the controls
        eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
            minPolarAngle: values.min,
            maxPolarAngle: values.max
        });
    };

    useEffect(() => {
        const handleControlInfo = (data) => {
            setControlInfo(data);

            // Load zoom and angle settings from incoming data if available
            if (data && data.type === 'orbit') {
                if (data.zoom) {
                    setControlSettings(prev => ({
                        ...prev,
                        minDistance: data.zoom.min,
                        maxDistance: data.zoom.max
                    }));
                }
                if (data.angle) {
                    setControlSettings(prev => ({
                        ...prev,
                        minPolarAngle: data.angle.min,
                        maxPolarAngle: data.angle.max
                    }));
                }
            }

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
                    }),
                    // Include control settings for orbit controls
                    ...(data.type === 'orbit' && data.zoom && data.angle && {
                        zoom: {
                            min: parseFloat(data.zoom.min.toFixed(FLOAT_PRECISION)),
                            max: parseFloat(data.zoom.max.toFixed(FLOAT_PRECISION))
                        },
                        angle: {
                            min: parseFloat(data.angle.min.toFixed(FLOAT_PRECISION)),
                            max: parseFloat(data.angle.max.toFixed(FLOAT_PRECISION))
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
                    <MinMaxHandle
                        label="Zoom"
                        minValue={controlSettings.minDistance}
                        maxValue={controlSettings.maxDistance}
                        rangeMin={0.1}
                        rangeMax={200}
                        step={0.1}
                        editable={true}
                        onValueChange={handleZoomChange}
                    />
                    <MinMaxHandle
                        label="Angle"
                        minValue={controlSettings.minPolarAngle}
                        maxValue={controlSettings.maxPolarAngle}
                        rangeMin={0}
                        rangeMax={Math.PI}
                        step={0.01}
                        editable={true}
                        onValueChange={handleAngleChange}
                    />
                </>
            )}
        </DebugBlock>
    );
}
