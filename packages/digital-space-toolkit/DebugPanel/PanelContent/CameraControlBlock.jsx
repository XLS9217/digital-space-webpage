import React, { useEffect, useState, useCallback } from 'react';
import { eventChannelHub, INFO_CHANNELS, CONTROL_CHANNELS } from "../../EventChannelHub";
import { CONTROL_TYPE } from "../../SceneTypeEnum";
import DebugBlock from "../CommonComponent/DebugBlock";
import CoordDisplayer from "../CommonComponent/CoordDisplayer";
import MinMaxHandle from "../CommonComponent/MinMaxHandle";
import CheckBox from "../CommonComponent/CheckBox";
import { SnapshotIcon } from "../CodeSvg";

const FLOAT_PRECISION = 3;

export default function CameraControlBlock({ onSerializedUpdate }) {
    const [controlInfo, setControlInfo] = useState(null);
    const [controlSettings, setControlSettings] = useState({
        minDistance: 1,
        maxDistance: 100,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        enablePan: true,
        enableRotate: true,
        enableZoom: true
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

    const handleEnableChange = (property, value) => {
        setControlSettings(prev => ({
            ...prev,
            [property]: value
        }));

        // Publish to update the controls
        eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
            [property]: value
        });
    };

    const handlePrintControl = useCallback(() => {
        eventChannelHub.publish(CONTROL_CHANNELS.PRINT_CONTROL);
    }, []);

    const handleSnapshotControl = useCallback(() => {
        // TODO: Implement snapshot functionality
        console.log("Snapshot control settings (to be implemented)");
    }, []);

    useEffect(() => {
        const handleControlInfo = (data) => {
            setControlInfo(data);

            // Load zoom and angle settings from incoming data if available
            if (data && data.type === CONTROL_TYPE.ORBIT) {
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
                // Load enable settings if available
                if (data.enablePan !== undefined) {
                    setControlSettings(prev => ({ ...prev, enablePan: data.enablePan }));
                }
                if (data.enableRotate !== undefined) {
                    setControlSettings(prev => ({ ...prev, enableRotate: data.enableRotate }));
                }
                if (data.enableZoom !== undefined) {
                    setControlSettings(prev => ({ ...prev, enableZoom: data.enableZoom }));
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
                    ...(data.type === CONTROL_TYPE.ORBIT && data.zoom && data.angle && {
                        zoom: {
                            min: parseFloat(data.zoom.min.toFixed(FLOAT_PRECISION)),
                            max: parseFloat(data.zoom.max.toFixed(FLOAT_PRECISION))
                        },
                        angle: {
                            min: parseFloat(data.angle.min.toFixed(FLOAT_PRECISION)),
                            max: parseFloat(data.angle.max.toFixed(FLOAT_PRECISION))
                        },
                        enablePan: data.enablePan !== undefined ? data.enablePan : true,
                        enableRotate: data.enableRotate !== undefined ? data.enableRotate : true,
                        enableZoom: data.enableZoom !== undefined ? data.enableZoom : true
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

    if (!controlInfo) return <div className="debug-item no-data">No control data</div>;

    const { type, position, target, rotation } = controlInfo;

    return (
        <div className="debug-section-list">
            <DebugBlock
                title="Control Info"
                type={type}
                initialExpanded={true}
                onPrint={handlePrintControl}
                onSnapshot={handleSnapshotControl}
            >
                <CoordDisplayer label="Init Pos" value={position} />
                {target && <CoordDisplayer label="Target" value={target} />}
                {rotation && <CoordDisplayer label="Rot" value={rotation} />}

                {type === CONTROL_TYPE.ORBIT && (
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
                            showCurrentValue={true}
                            currentValue={controlInfo.zoom?.current || 0}
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
                            showCurrentValue={true}
                            currentValue={controlInfo.angle?.current || 0}
                        />
                        <CheckBox
                            label="Pan"
                            checked={controlSettings.enablePan}
                            onChange={(value) => handleEnableChange('enablePan', value)}
                        />
                        <CheckBox
                            label="Rotate"
                            checked={controlSettings.enableRotate}
                            onChange={(value) => handleEnableChange('enableRotate', value)}
                        />
                        <CheckBox
                            label="Zoom"
                            checked={controlSettings.enableZoom}
                            onChange={(value) => handleEnableChange('enableZoom', value)}
                        />
                    </>
                )}
            </DebugBlock>
        </div>
    );
}
