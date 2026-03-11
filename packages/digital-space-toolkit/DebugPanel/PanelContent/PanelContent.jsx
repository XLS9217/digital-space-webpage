import React from 'react'//for webpack consistency,
import { useState } from "react";
import { PrinterIcon, DownloadIcon, UploadIcon, PlusCircleIcon } from "../CodeSvg";
import ModelList from "./ModelList";
import LightList from "./LightList";
import CameraControlBlock from "./CameraControlBlock";
import dataRegistry from "../../DataRegistry.js";
import { eventChannelHub, CONTROL_CHANNELS } from '../../EventChannelHub';
import './PanelContent.css';

export default function PanelContent({ sceneData, showJson }) {

    const [controlInfo, setControlInfo] = useState(null);
    const [serializedModels, setSerializedModels] = useState([]);
    const [serializedLights, setSerializedLights] = useState([]);
    const [showNewLight, setShowNewLight] = useState(false);
    const [showNewModel, setShowNewModel] = useState(false);

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
            const blob = await dataRegistry.download(json.scene);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${json.scene}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download scene:', error);
            alert('Failed to download scene. Please try again.');
        }
    };

    const handleUpload = async () => {
        const json = getSerializedSceneJson();
        if (!json || !json.scene) return;

        try {
            const { scene, ...config } = json;
            const result = await dataRegistry.upsert(scene, config);
            console.log("Scene upserted:", result);
        } catch (error) {
            console.error('Failed to upload scene:', error);
            alert('Failed to upload scene config. Please try again.');
        }
    };

    const handleAddModel = async (newModel) => {
        const json = getSerializedSceneJson();
        if (!json || !json.scene) throw new Error('No scene data');

        const { scene, ...config } = json;
        config.models = [...(config.models || []), newModel];
        await dataRegistry.upsert(scene, config);
        eventChannelHub.publish(CONTROL_CHANNELS.SCENE_RELOAD);
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
                            <span title="Print Scene JSON to console">
                                <PrinterIcon
                                    size={16}
                                    className="debug-action-icon"
                                    onClick={handlePrint}
                                />
                            </span>
                            <span title={dataRegistry.download ? "Download Scene ZIP" : "Need to register via webRegistry"}>
                                <DownloadIcon
                                    size={16}
                                    className={`debug-action-icon${dataRegistry.download ? '' : ' disabled'}`}
                                    onClick={dataRegistry.download ? handleDownload : undefined}
                                />
                            </span>
                            <span title={dataRegistry.upsert ? "Upsert Scene Config" : "Need to register via webRegistry"}>
                                <UploadIcon
                                    size={16}
                                    className={`debug-action-icon${dataRegistry.upsert ? '' : ' disabled'}`}
                                    onClick={dataRegistry.upsert ? handleUpload : undefined}
                                />
                            </span>
                        </div>
                    </div>
                    <div className="debug-list">
                        <CameraControlBlock onSerializedUpdate={setControlInfo} />
                        <div className="debug-list-title">
                            <h3>Model List</h3>
                            <PlusCircleIcon
                                size={20}
                                className="debug-action-icon"
                                onClick={() => setShowNewModel(true)}
                                title="Add Model"
                            />
                        </div>
                        <ModelList
                            models={sceneData?.models}
                            onSerializedUpdate={setSerializedModels}
                            showNewItem={showNewModel}
                            onNewItemDone={() => setShowNewModel(false)}
                            onAddModel={handleAddModel}
                        />
                        <div className="debug-list-title">
                            <h3>Light List</h3>
                            <PlusCircleIcon
                                size={20}
                                className="debug-action-icon"
                                onClick={() => setShowNewLight(true)}
                                title="Add Light"
                            />
                        </div>
                        <LightList
                            lights={sceneData?.lights}
                            onSerializedUpdate={setSerializedLights}
                            showNewItem={showNewLight}
                            onNewItemDone={() => setShowNewLight(false)}
                        />
                    </div>
                </>
            )}
        </div>
    );
}