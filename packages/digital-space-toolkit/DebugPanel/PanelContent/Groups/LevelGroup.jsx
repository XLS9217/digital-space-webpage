/*
 * LevelGroup — group type "level"
 * Layers store uuids[] referencing scene objects via SceneObjectRegistry.
 * On upsert serialization, uuids are converted back to names.
 */

import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock';
import DebugButton from '../../CommonComponent/DebugButton';
import TagList from '../../CommonComponent/TagList';
import CoordDisplayer from '../../CommonComponent/CoordDisplayer';
import CameraControlSnapshot from '../CameraControlSnapshot';
import { GROUP_TYPE } from '../../../SceneTypeEnum';
import { infoStoreHub, DEBUG_STORE } from '../../../InfoStoreHub';
import sceneObjectRegistry from '../../../DigitalScene/SceneObjectRegistry';

// Build display labels for TagList: show name, backed by uuid
const buildTagOptions = (modelEntries) =>
    modelEntries.map(e => ({ value: e.uuid, label: e.data?.name || e.uuid }));

const LayerGroup = ({ group, depth = 0, onDelete, modelEntries, onInvestigate, serializeGroup, onItemSerialized, index }) => {
    const [localUuids, setLocalUuids] = useState(group.uuids || []);
    const [savedControl, setSavedControl] = useState(group.metadata?.control || null);

    const handleSnapshot = useCallback(() => {
        const controlData = infoStoreHub.get(DEBUG_STORE.CURRENT_CONTROL);
        if (controlData) {
            const snapshot = {
                type: controlData.type,
                position: { ...controlData.position },
                target: controlData.target ? { ...controlData.target } : null,
                rotation: controlData.rotation ? { ...controlData.rotation } : null,
                ...(controlData.zoom && {
                    zoom: {
                        min: controlData.zoom.min,
                        max: controlData.zoom.max,
                        current: controlData.zoom.current
                    }
                }),
                ...(controlData.angle && {
                    angle: {
                        min: controlData.angle.min,
                        max: controlData.angle.max,
                        current: controlData.angle.current
                    }
                }),
                enablePan: controlData.enablePan,
                enableRotate: controlData.enableRotate,
                enableZoom: controlData.enableZoom
            };
            setSavedControl(snapshot);
        }
    }, []);

    const handleDeleteControl = useCallback(() => {
        setSavedControl(null);
    }, []);

    // Notify parent with serialized state
    useEffect(() => {
        if (onItemSerialized) {
            onItemSerialized(index, serializeGroup({
                name: group.name,
                type: group.type,
                uuids: localUuids,
                groups: [],
                metadata: savedControl ? { control: savedControl } : undefined
            }));
        }
    }, [localUuids, savedControl, onItemSerialized, index, serializeGroup, group.name, group.type]);

    // Tag options: all model entries as { value: uuid, label: name }
    const tagOptions = buildTagOptions(modelEntries);
    // Display tags: resolve uuid → name for display
    const displayTags = localUuids.map(uuid => {
        const data = sceneObjectRegistry.getData(uuid);
        return data?.name || uuid;
    });

    return (
        <div style={{ marginLeft: depth > 0 ? 12 : 0 }}>
            <DebugBlock
                title={group.name || 'Unnamed Layer'}
                type={group.type}
                alwaysExpanded
                onDelete={onDelete}
                onSnapshot={handleSnapshot}
            >
                <TagList
                    tags={displayTags}
                    onChange={(newDisplayTags) => {
                        // Map display names back to uuids
                        const newUuids = newDisplayTags.map(tag => {
                            // If tag is already a uuid in our list, keep it
                            if (localUuids.includes(tag)) return tag;
                            // Otherwise find uuid by name
                            const entry = sceneObjectRegistry.findByName(tag);
                            return entry?.uuid || tag;
                        });
                        setLocalUuids(newUuids);
                    }}
                    recommendation={tagOptions.map(o => o.label)}
                    limitation={tagOptions.map(o => o.label)}
                />
                <CameraControlSnapshot savedControl={savedControl} onDelete={handleDeleteControl} />
                <DebugButton
                    label="Investigate"
                    onClick={onInvestigate}
                    title="Bring this layer to the top of the stack"
                />
            </DebugBlock>
        </div>
    );
};

const LevelGroup = ({ group, depth = 0, onDelete, serializeGroup, modelEntries = [], onItemSerialized, index, sceneController }) => {
    const [localName, setLocalName] = useState(group.name || '');
    const [layers, setLayers] = useState(group.groups || []);
    const [liftTarget, setLiftTarget] = useState(group.metadata?.liftTarget || { x: 0, y: 50, z: 0 });
    const [serializedLayers, setSerializedLayers] = useState({});

    useEffect(() => {
        setLocalName(group.name || '');
    }, [group]);

    // Initialize with default layer "1" if no layers exist
    useEffect(() => {
        if (!group.groups || group.groups.length === 0) {
            setLayers([{
                name: '1',
                type: GROUP_TYPE.LEVEL.LAYER,
                uuids: [],
                groups: []
            }]);
        }
    }, []);

    const addLayer = (atEnd) => {
        setLayers(prev => {
            const layerNumbers = prev.map(f => parseInt(f.name) || 0);
            const maxLayer = Math.max(...layerNumbers);
            const minLayer = Math.min(...layerNumbers);

            const newLayer = {
                name: String(atEnd ? minLayer - 1 : maxLayer + 1),
                type: GROUP_TYPE.LEVEL.LAYER,
                uuids: [],
                groups: []
            };
            return atEnd ? [...prev, newLayer] : [newLayer, ...prev];
        });
    };

    const deleteLayer = (index) => {
        setLayers(prev => prev.filter((_, i) => i !== index));
        setSerializedLayers(prev => {
            const { [index]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleLayerSerialized = useCallback((layerIndex, serializedData) => {
        setSerializedLayers(prev => ({
            ...prev,
            [layerIndex]: serializedData
        }));
    }, []);

    const handleInvestigate = useCallback((layerIndex) => {
        if (sceneController) {
            sceneController.investigateLayer(localName, layerIndex);
        }
    }, [sceneController, localName]);

    // Sync liftTarget changes to the controller
    useEffect(() => {
        if (sceneController) {
            const controller = sceneController.controllerMap.get(localName);
            if (controller) {
                controller.liftTarget = liftTarget;
            }
        }
    }, [liftTarget, sceneController, localName]);

    // Handle name changes
    useEffect(() => {
        if (sceneController && group.name && localName !== group.name) {
            sceneController.renameGroup(group.name, localName);
        }
    }, [localName, sceneController, group.name]);

    const handlePrint = useCallback(() => {
        const layersWithSerialized = layers.map((layer, i) => serializedLayers[i] || layer);
        const currentGroup = {
            name: localName,
            type: group.type,
            uuids: group.uuids || [],
            groups: layersWithSerialized,
            metadata: { liftTarget: liftTarget }
        };
        const serialized = serializeGroup(currentGroup);
        console.log('Level Group Serialized:', serialized);
    }, [localName, group.type, group.uuids, layers, liftTarget, serializedLayers, serializeGroup]);

    // Notify parent with serialized state and update SceneController
    useEffect(() => {
        const layersWithSerialized = layers.map((layer, i) => serializedLayers[i] || layer);
        const currentGroup = {
            name: localName,
            type: group.type,
            uuids: group.uuids || [],
            groups: layersWithSerialized,
            metadata: { liftTarget: liftTarget }
        };

        if (onItemSerialized) {
            onItemSerialized(index, serializeGroup(currentGroup));
        }

        if (sceneController && sceneController.updateGroup) {
            sceneController.updateGroup(localName, currentGroup);
        }
    }, [localName, group.type, group.uuids, layers, liftTarget, serializedLayers, onItemSerialized, index, serializeGroup, sceneController]);

    return (
        <div style={{ marginLeft: depth > 0 ? 12 : 0 }}>
            <DebugBlock
                title={localName || 'Unnamed Level'}
                type={group.type}
                onTitleChange={(newName) => setLocalName(newName)}
                onDelete={onDelete}
                onPrint={handlePrint}
            >
                <CoordDisplayer
                    label="Lift Target"
                    value={liftTarget}
                    editable={true}
                    onValueChange={(newValue) => setLiftTarget(newValue)}
                />
                <div className="layer-list">
                    <span
                        className="layer-insert-btn"
                        onClick={() => addLayer(false)}
                        title="Add layer to top"
                    >+</span>
                    {layers.map((child, i) => (
                        <LayerGroup
                            key={child.name + i}
                            group={child}
                            depth={depth + 1}
                            index={i}
                            onDelete={() => deleteLayer(i)}
                            modelEntries={modelEntries}
                            onInvestigate={() => handleInvestigate(i)}
                            serializeGroup={serializeGroup}
                            onItemSerialized={handleLayerSerialized}
                        />
                    ))}
                    <span
                        className="layer-insert-btn"
                        onClick={() => addLayer(true)}
                        title="Add layer to bottom"
                    >+</span>
                </div>
            </DebugBlock>
        </div>
    );
};

export default LevelGroup;
