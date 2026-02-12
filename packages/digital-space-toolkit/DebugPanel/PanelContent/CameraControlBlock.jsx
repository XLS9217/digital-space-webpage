import React, { useEffect, useState } from 'react';
import { eventChannelHub, INFO_CHANNELS } from "../../EventChannelHub";
import DebugBlock from "../CommonComponent/DebugBlock";
import CoordDisplayer from "../CommonComponent/CoordDisplayer";

const FLOAT_PRECISION = 3;

export default function CameraControlBlock({ onSerializedUpdate }) {
    const [controlInfo, setControlInfo] = useState(null);

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
            <CoordDisplayer label="Pos" value={position} />
            {target && <CoordDisplayer label="Target" value={target} />}
            {rotation && <CoordDisplayer label="Rot" value={rotation} />}
        </DebugBlock>
    );
}
