import { useEffect, useState } from "react";
import { eventChannelHub, DEBUG_CHANNELS } from "../../EventChannelHub";
import { CopyIcon, PrinterIcon, DownloadIcon } from "../CodeSvg";
import ModelList from "./ModelList";
import LightList from "./LightList";
import './PanelContent.css';

export default function PanelContent({ sceneData, showJson }) {

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

    const getSanitizedSceneJson = () => {
        if (!sceneData) return null;

        const sanitizeVector = (vec) => {
            if (!vec) return { x: 0, y: 0, z: 0 };
            if (Array.isArray(vec)) return { x: vec[0], y: vec[1], z: vec[2] };
            return {
                x: vec.x || 0,
                y: vec.y || 0,
                z: vec.z || 0
            };
        };

        const sanitizedModels = (sceneData.models || []).map(model => ({
            name: model.name,
            type: model.type,
            file_location: model.file_location,
            url: model.url, // KEEPING URL as it's in the input example
            position: sanitizeVector(model.position),
            rotation: sanitizeVector(model.rotation),
            scale: typeof model.scale === 'number' 
                ? { x: model.scale, y: model.scale, z: model.scale } 
                : sanitizeVector(model.scale)
        }));

        return {
            _id: sceneData._id,
            scene: sceneData.scene,
            camera: cameraPosition ? {
                position: {
                    x: parseFloat(cameraPosition.x.toFixed(FLOAT_PRECISION)),
                    y: parseFloat(cameraPosition.y.toFixed(FLOAT_PRECISION)),
                    z: parseFloat(cameraPosition.z.toFixed(FLOAT_PRECISION))
                }
            } : null,
            lights: (sceneData.lights && sceneData.lights.length > 0) 
                ? sceneData.lights.map(light => ({
                    ...light,
                    position: light.position ? sanitizeVector(light.position) : undefined
                }))
                : [
                    { name: 'Ambient', type: 'AmbientLight', intensity: 0.5 },
                    { name: 'Directional', type: 'DirectionalLight', intensity: 1, position: { x: 10, y: 10, z: 5 } }
                ],
            models: sanitizedModels
        };
    };

    const handlePrint = () => {
        const json = getSanitizedSceneJson();
        if (json) {
            console.log("Scene JSON:", json);
        }
    };

    const handleDownload = () => {
        const json = getSanitizedSceneJson();
        if (!json) return;

        const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${json.scene || 'scene'}_${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

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
            {showJson ? (
                <>
                    <h3>Scene JSON</h3>
                    <div className="debug-list">
                        {sceneData ? (
                            <div className="debug-item scene-data">
                                <pre>{JSON.stringify(sceneData, null, 2)}</pre>
                            </div>
                        ) : (
                            <div className="debug-item">
                                <span>No scene data available</span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <div className="debug-header-row">
                        <h3>Debug Info</h3>
                        <div className="debug-actions">
                            <PrinterIcon 
                                size={16} 
                                className="debug-action-icon" 
                                onClick={handlePrint}
                                title="Print Scene JSON to console"
                            />
                            <DownloadIcon 
                                size={16} 
                                className="debug-action-icon" 
                                onClick={handleDownload}
                                title="Download Scene JSON"
                            />
                        </div>
                    </div>
                    <div className="debug-list">
                        <div className="debug-item">
                            {renderPosition()}
                        </div>
                        <h3>Model List</h3>
                        <ModelList models={sceneData?.models} />
                        <h3>Light List</h3>
                        <LightList lights={sceneData?.lights} />
                    </div>
                </>
            )}
        </div>
    );
}