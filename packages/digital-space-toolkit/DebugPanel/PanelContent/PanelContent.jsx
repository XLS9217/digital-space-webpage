import React from 'react'//for webpack consistency,
import { useState, useEffect } from "react";
import { PrinterIcon, DownloadIcon, UploadIcon, PlusCircleIcon, ChevronIcon } from "../CodeSvg";
import ModelList from "./ModelList";
import LightList from "./LightList";
import GroupList from "./Groups/GroupList.jsx";
import GeneralSetting from "./GeneralSetting/GeneralSetting.jsx";
import InteractionSetting from "./InteractionSetting";
import DebugButton from "../CommonComponent/DebugButton";
import CheckBox from "../CommonComponent/CheckBox";
import EnumSelect from "../CommonComponent/EnumSelect";
import dataRegistry from "../../DataRegistry.js";
import { eventChannelHub, CONTROL_CHANNELS, INFO_CHANNELS, DEBUG_CHANNELS } from '../../EventChannelHub';
import sceneObjectRegistry from '../../DigitalScene/SceneObjectRegistry';
import './PanelContent.css';

const PERF_POSITION = {
    'top-left': 'top-left',
    'top-right': 'top-right',
    'bottom-left': 'bottom-left',
    'bottom-right': 'bottom-right'
};

export default function PanelContent({ sceneData, showJson, sceneController }) {

    const [controlInfo, setControlInfo] = useState(null);
    const [generalInfo, setGeneralInfo] = useState(null);
    const [serializedModels, setSerializedModels] = useState([]);
    const [serializedLights, setSerializedLights] = useState([]);
    const [serializedGroups, setSerializedGroups] = useState([]);
    const [showNewLight, setShowNewLight] = useState(false);
    const [showNewModel, setShowNewModel] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [modelsExpanded, setModelsExpanded] = useState(false);
    const [lightsExpanded, setLightsExpanded] = useState(false);
    const [groupsExpanded, setGroupsExpanded] = useState(false);
    const [currentState, setCurrentState] = useState('big-view');
    const [perfEnabled, setPerfEnabled] = useState(false);
    const [perfPosition, setPerfPosition] = useState('bottom-right');
    const [notification, setNotification] = useState(null);

    // Listen for state changes
    useEffect(() => {
        const handleStateChange = ({ stateType }) => {
            setCurrentState(stateType);
        };

        eventChannelHub.subscribe(INFO_CHANNELS.SCENE_STATE_CHANGE, handleStateChange);

        return () => {
            eventChannelHub.unsubscribe(INFO_CHANNELS.SCENE_STATE_CHANGE, handleStateChange);
        };
    }, []);

    const getSerializedSceneJson = () => {
        if (!sceneData) return null;

        return {
            scene: sceneData.scene,
            general: generalInfo,
            control: controlInfo,
            lights: serializedLights,
            models: serializedModels,
            groups: serializedGroups
        };
    };

    const handlePrint = () => {
        eventChannelHub.publish(CONTROL_CHANNELS.PRINT_SCENE);
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
            console.log("Upsert payload:", JSON.stringify(config, null, 2));
            const result = await dataRegistry.upsert(scene, config);
            console.log("Scene upserted:", result);
            setNotification({ type: 'success', message: 'Scene saved successfully' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error('Failed to upload scene:', error);
            setNotification({ type: 'error', message: 'Failed to save scene' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleAddModel = async (newModel) => {
        // Get file URL from backend
        const url = await dataRegistry.getFileUrl(newModel.file_location);

        // Add URL to the model
        const modelWithUrl = { ...newModel, url };

        // Publish event to add model to scene dynamically (no reload)
        eventChannelHub.publish(CONTROL_CHANNELS.MODEL_LIST_UPDATE, {
            action: 'add',
            model: modelWithUrl
        });

        // Return the model with URL so ModelList can update its local state
        return modelWithUrl;
    };

    const handlePerfToggle = (enabled) => {
        setPerfEnabled(enabled);
        eventChannelHub.publish(DEBUG_CHANNELS.PERF_WINDOW_TOGGLE, { enabled, position: perfPosition });
    };

    const handlePerfPositionChange = (position) => {
        setPerfPosition(position);
        if (perfEnabled) {
            eventChannelHub.publish(DEBUG_CHANNELS.PERF_WINDOW_TOGGLE, { enabled: true, position });
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
                            <span title="Print Three.js Scene to console">
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
                    {notification && (
                        <div className={`upload-status ${notification.type}`}>
                            {notification.message}
                        </div>
                    )}
                    <div className="debug-list">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', marginBottom: '8px' }}>
                            <span style={{ color: '#ccc', fontSize: '13px' }}>
                                State: <strong>{currentState}</strong>
                            </span>
                            {currentState === 'level-view' && (
                                <DebugButton
                                    label="← Back"
                                    onClick={() => {
                                        sceneController?.goBack();
                                        setCurrentState('big-view');
                                    }}
                                    title="Go back to Big View"
                                />
                            )}
                        </div>
                        <div style={{ padding: '0 0 8px 0' }}>
                            <CheckBox
                                label="Performance"
                                checked={perfEnabled}
                                onChange={handlePerfToggle}
                            />
                            {perfEnabled && (
                                <EnumSelect
                                    enumObj={PERF_POSITION}
                                    onSelect={handlePerfPositionChange}
                                />
                            )}
                        </div>
                        <GeneralSetting
                            onSerializedUpdate={setGeneralInfo}
                            initialGeneral={sceneData?.general}
                        />
                        <InteractionSetting
                            onSerializedUpdate={setControlInfo}
                            initialControl={sceneData?.control}
                        />
                        <div className="debug-list-title">
                            <div className="debug-list-title-left" onClick={() => setGroupsExpanded(!groupsExpanded)}>
                                <ChevronIcon size={14} isCollapsed={!groupsExpanded} style={{ marginRight: '4px' }} />
                                <h3>Group List [{sceneData?.groups?.length || 0}]</h3>
                                <PlusCircleIcon
                                    size={20}
                                    className="debug-action-icon"
                                    onClick={(e) => { e.stopPropagation(); setShowNewGroup(true); }}
                                    title="Add Group"
                                />
                            </div>
                        </div>
                        <div style={{ display: groupsExpanded ? 'block' : 'none' }}>
                            <GroupList
                                groups={sceneData?.groups}
                                modelEntries={[...sceneObjectRegistry.all('model')]}
                                showNewItem={showNewGroup}
                                onNewItemDone={() => setShowNewGroup(false)}
                                onSerializedUpdate={setSerializedGroups}
                                sceneController={sceneController}
                            />
                        </div>
                        <div className="debug-list-title">
                            <div className="debug-list-title-left" onClick={() => setModelsExpanded(!modelsExpanded)}>
                                <ChevronIcon size={14} isCollapsed={!modelsExpanded} style={{ marginRight: '4px' }} />
                                <h3>Model List [{sceneData?.models?.length || 0}]</h3>
                                <PlusCircleIcon
                                    size={20}
                                    className="debug-action-icon"
                                    onClick={(e) => { e.stopPropagation(); setShowNewModel(true); }}
                                    title="Add Model"
                                />
                            </div>
                        </div>
                        <div style={{ display: modelsExpanded ? 'block' : 'none' }}>
                            <ModelList
                                models={sceneData?.models}
                                onSerializedUpdate={setSerializedModels}
                                showNewItem={showNewModel}
                                onNewItemDone={() => setShowNewModel(false)}
                                onAddModel={handleAddModel}
                            />
                        </div>
                        <div className="debug-list-title">
                            <div className="debug-list-title-left" onClick={() => setLightsExpanded(!lightsExpanded)}>
                                <ChevronIcon size={14} isCollapsed={!lightsExpanded} style={{ marginRight: '4px' }} />
                                <h3>Light List [{sceneData?.lights?.length || 0}]</h3>
                                <PlusCircleIcon
                                    size={20}
                                    className="debug-action-icon"
                                    onClick={(e) => { e.stopPropagation(); setShowNewLight(true); }}
                                    title="Add Light"
                                />
                            </div>
                        </div>
                        <div style={{ display: lightsExpanded ? 'block' : 'none' }}>
                            <LightList
                                lights={sceneData?.lights}
                                onSerializedUpdate={setSerializedLights}
                                showNewItem={showNewLight}
                                onNewItemDone={() => setShowNewLight(false)}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}