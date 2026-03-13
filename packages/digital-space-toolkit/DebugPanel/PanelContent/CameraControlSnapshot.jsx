import React from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';
import MinMaxHandle from '../CommonComponent/MinMaxHandle';
import CheckBox from '../CommonComponent/CheckBox';
import { CONTROL_TYPE } from '../../SceneTypeEnum';

/**
 * CameraControlSnapshot - Read-only display of saved camera control state
 * Used in layer groups to show the snapshot of camera settings
 * Does not show current value indicators (triangle)
 */
export default function CameraControlSnapshot({ savedControl, onDelete }) {
    if (!savedControl) return null;

    return (
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
            <DebugBlock
                title="Control"
                type={savedControl.type}
                alwaysExpanded
                onDelete={onDelete}
            >
                <CoordDisplayer label="Init Pos" value={savedControl.position} editable={false} />
                {savedControl.target && <CoordDisplayer label="Target" value={savedControl.target} editable={false} />}
                {savedControl.rotation && <CoordDisplayer label="Rot" value={savedControl.rotation} editable={false} />}

                {savedControl.type === CONTROL_TYPE.ORBIT && (
                    <>
                        {savedControl.zoom && (
                            <MinMaxHandle
                                label="Zoom"
                                minValue={savedControl.zoom.min}
                                maxValue={savedControl.zoom.max}
                                rangeMin={0.1}
                                rangeMax={200}
                                step={0.1}
                                editable={false}
                                showCurrentValue={false}
                            />
                        )}
                        {savedControl.angle && (
                            <MinMaxHandle
                                label="Angle"
                                minValue={savedControl.angle.min}
                                maxValue={savedControl.angle.max}
                                rangeMin={0}
                                rangeMax={Math.PI}
                                step={0.01}
                                editable={false}
                                showCurrentValue={false}
                            />
                        )}
                        {savedControl.enablePan !== undefined && (
                            <CheckBox
                                label="Pan"
                                checked={savedControl.enablePan}
                                disabled={true}
                            />
                        )}
                        {savedControl.enableRotate !== undefined && (
                            <CheckBox
                                label="Rotate"
                                checked={savedControl.enableRotate}
                                disabled={true}
                            />
                        )}
                        {savedControl.enableZoom !== undefined && (
                            <CheckBox
                                label="Zoom"
                                checked={savedControl.enableZoom}
                                disabled={true}
                            />
                        )}
                    </>
                )}
            </DebugBlock>
        </div>
    );
}