import { useEffect, useState } from "react";
import { eventChannelHub, DEBUG_CHANNELS } from "../../EventChannelHub";
import { CopyIcon } from "../CodeSvg";
import './PanelContent.css';

export default function PanelContent({ sceneData }) {

    const FLOAT_PRECISION = 3;

    const [cameraPosition, setCameraPosition] = useState(null);

    useEffect(() => {
        const handleDebugMessage = (data) => {
            if (typeof data === "string") {
                try {
                    const parsed = JSON.parse(data);
                    setCameraPosition(parsed);
                } catch {
                    setCameraPosition(data);
                }
                return;
            }

            setCameraPosition(data);
        };

        eventChannelHub.subscribe(DEBUG_CHANNELS.INTERNAL_DEBUG_CAMERA, handleDebugMessage);
        return () => {
            eventChannelHub.unsubscribe(DEBUG_CHANNELS.INTERNAL_DEBUG_CAMERA, handleDebugMessage);
        };
    }, []);

    const handleCopy = () => {
        const jsonData = {
            x: parseFloat(cameraPosition.x.toFixed(FLOAT_PRECISION)),
            y: parseFloat(cameraPosition.y.toFixed(FLOAT_PRECISION)),
            z: parseFloat(cameraPosition.z.toFixed(FLOAT_PRECISION))
        };
        console.log( JSON.stringify(jsonData) );
        navigator.clipboard.writeText(JSON.stringify(jsonData));
    };

    const renderPosition = () => {
        if (!cameraPosition) return <span>No data</span>;

        if (typeof cameraPosition === 'object' && cameraPosition.x !== undefined) {
            const x = parseFloat(cameraPosition.x).toFixed(FLOAT_PRECISION);
            const y = parseFloat(cameraPosition.y).toFixed(FLOAT_PRECISION);
            const z = parseFloat(cameraPosition.z).toFixed(FLOAT_PRECISION);

            return (
                <>
                    <div className="position-value">x:<span>{x}</span></div>
                    <div className="position-value">y:<span>{y}</span></div>
                    <div className="position-value">z:<span>{z}</span></div>
                    <CopyIcon
                        size={16}
                        className="copy-icon"
                        onClick={handleCopy}
                    />
                </>
            );
        }

        return <span>{JSON.stringify(cameraPosition)}</span>;
    };

    return (
        <div className="debug-panel-content">
            <h3>Debug Info</h3>
            <div className="debug-list">
                <div className="debug-item">
                    {renderPosition()}
                </div>
                {sceneData && (
                    <div className="debug-item scene-data">
                        <pre>{JSON.stringify(sceneData, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}