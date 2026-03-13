import React, { useEffect, useState, useCallback, useRef } from 'react';
import { eventChannelHub, INFO_CHANNELS, CONTROL_CHANNELS } from "../../EventChannelHub";
import { infoStoreHub, DEBUG_STORE } from "../../InfoStoreHub";
import { CONTROL_TYPE } from "../../SceneTypeEnum";
import DebugBlock from "../CommonComponent/DebugBlock";
import CoordDisplayer from "../CommonComponent/CoordDisplayer";
import MinMaxHandle from "../CommonComponent/MinMaxHandle";
import CheckBox from "../CommonComponent/CheckBox";

const FLOAT_PRECISION = 3;

const roundVec = (v) => v ? {
    x: parseFloat(v.x.toFixed(FLOAT_PRECISION)),
    y: parseFloat(v.y.toFixed(FLOAT_PRECISION)),
    z: parseFloat(v.z.toFixed(FLOAT_PRECISION))
} : null;

export default function CameraControlBlock({ onSerializedUpdate, initialControl }) {
    const [viewMode, setViewMode] = useState('saved'); // 'saved' | 'current'
    const [currentState, setCurrentState] = useState(null);
    const [savedState, setSavedState] = useState(null);
    const [controlSettings, setControlSettings] = useState({
        minDistance: 1,
        maxDistance: 100,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        enablePan: true,
        enableRotate: true,
        enableZoom: true
    });
    const initializedRef = useRef(false);

    // Sync from props when initialControl changes externally
    useEffect(() => {
        if (initialControl) {
            setSavedState(initialControl);
            setControlSettings({
                minDistance: initialControl.zoom?.min || 1,
                maxDistance: initialControl.zoom?.max || 100,
                minPolarAngle: initialControl.angle?.min || 0,
                maxPolarAngle: initialControl.angle?.max || Math.PI,
                enablePan: initialControl.enablePan !== undefined ? initialControl.enablePan : true,
                enableRotate: initialControl.enableRotate !== undefined ? initialControl.enableRotate : true,
                enableZoom: initialControl.enableZoom !== undefined ? initialControl.enableZoom : true
            });
            if (onSerializedUpdate) {
                onSerializedUpdate(initialControl);
            }
        }
    }, [initialControl, onSerializedUpdate]);

    const handleZoomChange = (values) => {
        setControlSettings(prev => ({
            ...prev,
            minDistance: values.min,
            maxDistance: values.max
        }));

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

        eventChannelHub.publish(CONTROL_CHANNELS.CAMERA_CONTROL_SETTINGS_UPDATE, {
            [property]: value
        });
    };

    const handlePrintControl = useCallback(() => {
        eventChannelHub.publish(CONTROL_CHANNELS.PRINT_CONTROL);
    }, []);

    const serializeSaved = useCallback((data, settings) => {
        if (!data || !onSerializedUpdate) return;
        const serialized = {
            type: data.type,
            position: roundVec(data.position),
            ...(data.target && { target: roundVec(data.target) }),
            ...(data.rotation && { rotation: roundVec(data.rotation) }),
            ...(data.type === CONTROL_TYPE.ORBIT && {
                zoom: {
                    min: parseFloat(settings.minDistance.toFixed(FLOAT_PRECISION)),
                    max: parseFloat(settings.maxDistance.toFixed(FLOAT_PRECISION))
                },
                angle: {
                    min: parseFloat(settings.minPolarAngle.toFixed(FLOAT_PRECISION)),
                    max: parseFloat(settings.maxPolarAngle.toFixed(FLOAT_PRECISION))
                },
                enablePan: settings.enablePan,
                enableRotate: settings.enableRotate,
                enableZoom: settings.enableZoom
            })
        };
        onSerializedUpdate(serialized);
    }, [onSerializedUpdate]);

    const handleSnapshotControl = useCallback(() => {
        if (!currentState) return;
        const snapped = {
            type: currentState.type,
            position: { ...currentState.position },
            target: currentState.target ? { ...currentState.target } : null,
            rotation: currentState.rotation ? { ...currentState.rotation } : null
        };
        setSavedState(snapped);
        serializeSaved(snapped, controlSettings);
    }, [currentState, controlSettings, serializeSaved]);

    useEffect(() => {
        const handleControlInfo = (data) => {
            setCurrentState(data);

            // Store current control data in InfoStoreHub
            infoStoreHub.store(DEBUG_STORE.CURRENT_CONTROL, data);

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

            // First data arrival: initialize saved state only if no initialControl was provided
            if (!initializedRef.current && data) {
                initializedRef.current = true;
                if (!initialControl) {
                    setSavedState(data);
                    if (onSerializedUpdate) {
                        const serialized = data ? {
                            type: data.type,
                            position: roundVec(data.position),
                            ...(data.target && { target: roundVec(data.target) }),
                            ...(data.rotation && { rotation: roundVec(data.rotation) }),
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
                }
            }
        };

        eventChannelHub.subscribe(INFO_CHANNELS.CAMERA_CONTROL_INFO, handleControlInfo);
        return () => {
            eventChannelHub.unsubscribe(INFO_CHANNELS.CAMERA_CONTROL_INFO, handleControlInfo);
        };
    }, [onSerializedUpdate, initialControl]);

    const displayData = viewMode === 'saved' ? savedState : currentState;

    if (!currentState) return <div className="debug-item no-data">No control data</div>;

    const { type } = currentState;

    return (
        <div className="debug-section-list">
            <DebugBlock
                title="Control"
                type={type}
                initialExpanded={true}
                onPrint={handlePrintControl}
                onSnapshot={handleSnapshotControl}
            >
                <div className="debug-view-toggle">
                    <button
                        className={`debug-view-toggle-btn ${viewMode === 'saved' ? 'debug-view-toggle-btn-active' : ''}`}
                        onClick={() => setViewMode('saved')}
                    >
                        Saved
                    </button>
                    <button
                        className={`debug-view-toggle-btn ${viewMode === 'current' ? 'debug-view-toggle-btn-active' : ''}`}
                        onClick={() => setViewMode('current')}
                    >
                        Current
                    </button>
                </div>

                {displayData && (
                    <>
                        <CoordDisplayer label="Init Pos" value={displayData.position} />
                        {displayData.target && <CoordDisplayer label="Target" value={displayData.target} />}
                        {displayData.rotation && <CoordDisplayer label="Rot" value={displayData.rotation} />}
                    </>
                )}

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
                            currentValue={currentState.zoom?.current || 0}
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
                            currentValue={currentState.angle?.current || 0}
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