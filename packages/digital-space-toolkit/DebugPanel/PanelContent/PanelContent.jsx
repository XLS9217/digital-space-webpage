import React from 'react'//for webpack consistency,
import { useState } from "react";
import { PrinterIcon, DownloadIcon } from "../CodeSvg";
import ModelList from "./ModelList";
import LightList from "./LightList";
import CameraControlBlock from "./CameraControlBlock";
import { downloadSceneZip } from "../../../../app/API/gateway";
import './PanelContent.css';

export default function PanelContent({ sceneData, showJson }) {

    const [controlInfo, setControlInfo] = useState(null);
    const [serializedModels, setSerializedModels] = useState([]);
    const [serializedLights, setSerializedLights] = useState([]);

    const getSerializedSceneJson = () => {
        if (!sceneData) return null;

        return {
            scene: sceneData.scene,
            control: controlInfo,
            lights: serializedLights,
            models: serializedModels
        };
    };

    const handlePrint = () => {
        const json = getSerializedSceneJson();
        if (json) {
            console.log("Scene JSON:", json);
        }
    };

    const handleDownload = async () => {
        const json = getSerializedSceneJson();
        if (!json || !json.scene) return;

        try {
            const blob = await downloadSceneZip(json.scene);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${json.scene}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download scene zip:', error);
            alert('Failed to download scene. Please try again.');
        }
    };

    return (
        <div className="debug-panel-content">
            {showJson ? (
                <>
                    <h3>Scene JSON</h3>
                    <div className="debug-list">
                        {sceneData ? (
                            <div className="debug-item scene-data">
                                <pre>{JSON.stringify(getSerializedSceneJson(), null, 2)}</pre>
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
                        <CameraControlBlock onSerializedUpdate={setControlInfo} />
                        <h3>Model List</h3>
                        <ModelList 
                            models={sceneData?.models} 
                            onSerializedUpdate={setSerializedModels} 
                        />
                        <h3>Light List</h3>
                        <LightList 
                            lights={sceneData?.lights} 
                            onSerializedUpdate={setSerializedLights} 
                        />
                    </div>
                </>
            )}
        </div>
    );
}