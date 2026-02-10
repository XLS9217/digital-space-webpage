import { useEffect, useState } from "react";
import { eventChannelHub, INFO_CHANNELS } from "../../EventChannelHub";
import { CopyIcon, PrinterIcon, DownloadIcon } from "../CodeSvg";
import ModelList from "./ModelList";
import LightList from "./LightList";
import './PanelContent.css';

export default function PanelContent({ sceneData, showJson }) {

    const FLOAT_PRECISION = 3;

    const [controlInfo, setControlInfo] = useState(null);

    useEffect(() => {
        const handleControlInfo = (data) => {
            setControlInfo(data);
        };

        eventChannelHub.subscribe(INFO_CHANNELS.CONTROL_INFO, handleControlInfo);
        return () => {
            eventChannelHub.unsubscribe(INFO_CHANNELS.CONTROL_INFO, handleControlInfo);
        };
    }, []);

    const getSerializedSceneJson = () => {
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
            control: controlInfo ? {
                type: controlInfo.type,
                position: {
                    x: parseFloat(controlInfo.position.x.toFixed(FLOAT_PRECISION)),
                    y: parseFloat(controlInfo.position.y.toFixed(FLOAT_PRECISION)),
                    z: parseFloat(controlInfo.position.z.toFixed(FLOAT_PRECISION))
                },
                ...(controlInfo.target && {
                    target: {
                        x: parseFloat(controlInfo.target.x.toFixed(FLOAT_PRECISION)),
                        y: parseFloat(controlInfo.target.y.toFixed(FLOAT_PRECISION)),
                        z: parseFloat(controlInfo.target.z.toFixed(FLOAT_PRECISION))
                    }
                }),
                ...(controlInfo.rotation && {
                    rotation: {
                        x: parseFloat(controlInfo.rotation.x.toFixed(FLOAT_PRECISION)),
                        y: parseFloat(controlInfo.rotation.y.toFixed(FLOAT_PRECISION)),
                        z: parseFloat(controlInfo.rotation.z.toFixed(FLOAT_PRECISION))
                    }
                })
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
        const json = getSerializedSceneJson();
        if (json) {
            console.log("Scene JSON:", json);
        }
    };

    const handleDownload = () => {
        const json = getSerializedSceneJson();
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
        if (!controlInfo) return;

        const jsonData = {
            type: controlInfo.type,
            position: {
                x: parseFloat(controlInfo.position.x.toFixed(FLOAT_PRECISION)),
                y: parseFloat(controlInfo.position.y.toFixed(FLOAT_PRECISION)),
                z: parseFloat(controlInfo.position.z.toFixed(FLOAT_PRECISION))
            },
            ...(controlInfo.target && {
                target: {
                    x: parseFloat(controlInfo.target.x.toFixed(FLOAT_PRECISION)),
                    y: parseFloat(controlInfo.target.y.toFixed(FLOAT_PRECISION)),
                    z: parseFloat(controlInfo.target.z.toFixed(FLOAT_PRECISION))
                }
            }),
            ...(controlInfo.rotation && {
                rotation: {
                    x: parseFloat(controlInfo.rotation.x.toFixed(FLOAT_PRECISION)),
                    y: parseFloat(controlInfo.rotation.y.toFixed(FLOAT_PRECISION)),
                    z: parseFloat(controlInfo.rotation.z.toFixed(FLOAT_PRECISION))
                }
            })
        };
        console.log(JSON.stringify(jsonData));
        navigator.clipboard.writeText(JSON.stringify(jsonData));
    };

    const renderControlInfo = () => {
        if (!controlInfo) return <span>No data</span>;

        const { type, position, target, rotation } = controlInfo;

        return (
            <>
                <div className="position-value">type:<span>{type}</span></div>
                <div className="position-value">pos.x:<span>{parseFloat(position.x).toFixed(FLOAT_PRECISION)}</span></div>
                <div className="position-value">pos.y:<span>{parseFloat(position.y).toFixed(FLOAT_PRECISION)}</span></div>
                <div className="position-value">pos.z:<span>{parseFloat(position.z).toFixed(FLOAT_PRECISION)}</span></div>
                {target && (
                    <>
                        <div className="position-value">target.x:<span>{parseFloat(target.x).toFixed(FLOAT_PRECISION)}</span></div>
                        <div className="position-value">target.y:<span>{parseFloat(target.y).toFixed(FLOAT_PRECISION)}</span></div>
                        <div className="position-value">target.z:<span>{parseFloat(target.z).toFixed(FLOAT_PRECISION)}</span></div>
                    </>
                )}
                {rotation && (
                    <>
                        <div className="position-value">rot.x:<span>{parseFloat(rotation.x).toFixed(FLOAT_PRECISION)}</span></div>
                        <div className="position-value">rot.y:<span>{parseFloat(rotation.y).toFixed(FLOAT_PRECISION)}</span></div>
                        <div className="position-value">rot.z:<span>{parseFloat(rotation.z).toFixed(FLOAT_PRECISION)}</span></div>
                    </>
                )}
                <CopyIcon
                    size={16}
                    className="copy-icon"
                    onClick={handleCopy}
                />
            </>
        );
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
                            {renderControlInfo()}
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