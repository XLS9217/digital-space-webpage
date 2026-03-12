/*
 * LevelGroup — group type "level"
 * Represents a level that contains named layers (sub-groups).
 * LayerGroup is a leaf node — no further nesting allowed.
 */

import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock';
import DebugButton from '../../CommonComponent/DebugButton';
import TagList from '../../CommonComponent/TagList';
import CoordDisplayer from '../../CommonComponent/CoordDisplayer';
import { GROUP_TYPE } from '../../../SceneTypeEnum';

const LayerGroup = ({ group, depth = 0, onDelete, onNamesChange, modelNames, onInvestigate }) => {
    return (
        <div style={{ marginLeft: depth > 0 ? 12 : 0 }}>
            <DebugBlock
                title={group.name || 'Unnamed Layer'}
                type={group.type}
                alwaysExpanded
                onDelete={onDelete}
            >
                <TagList
                    tags={group.names || []}
                    onChange={onNamesChange}
                    recommendation={modelNames}
                    limitation={modelNames}
                />
                <DebugButton
                    label="Investigate"
                    onClick={onInvestigate}
                    title="Bring this layer to the top of the stack"
                />
            </DebugBlock>
        </div>
    );
};

const LevelGroup = ({ group, depth = 0, onDelete, serializeGroup, modelNames = [], onItemSerialized, index, sceneController }) => {
    const [localName, setLocalName] = useState(group.name || '');
    const [layers, setLayers] = useState(group.groups || []);
    const [liftTarget, setLiftTarget] = useState(group.metadata?.liftTarget || { x: 0, y: 50, z: 0 });

    useEffect(() => {
        setLocalName(group.name || '');
    }, [group]);

    // Initialize with default layer "1" if no layers exist
    useEffect(() => {
        if (!group.groups || group.groups.length === 0) {
            setLayers([{
                name: '1',
                type: GROUP_TYPE.LEVEL.LAYER,
                names: [],
                groups: []
            }]);
        }
    }, []);

    const addLayer = (atEnd) => {
        setLayers(prev => {
            // Get current layer numbers
            const layerNumbers = prev.map(f => parseInt(f.name) || 0);
            const maxLayer = Math.max(...layerNumbers);
            const minLayer = Math.min(...layerNumbers);

            const newLayer = {
                name: String(atEnd ? minLayer - 1 : maxLayer + 1),
                type: GROUP_TYPE.LEVEL.LAYER,
                names: [],
                groups: []
            };
            return atEnd ? [...prev, newLayer] : [newLayer, ...prev];
        });
    };

    const deleteLayer = (index) => {
        setLayers(prev => prev.filter((_, i) => i !== index));
    };

    // Delegate investigate to the SceneController
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

    const handlePrint = useCallback(() => {
        const currentGroup = {
            name: localName,
            type: group.type,
            names: group.names || [],
            groups: layers,
            metadata: { liftTarget: liftTarget }
        };
        const serialized = serializeGroup(currentGroup);
        console.log('Level Group Serialized:', serialized);
    }, [localName, group.type, group.names, layers, liftTarget, serializeGroup]);

    // Notify parent with serialized state
    useEffect(() => {
        if (onItemSerialized) {
            onItemSerialized(index, serializeGroup({
                name: localName,
                type: group.type,
                names: group.names || [],
                groups: layers,
                metadata: { liftTarget: liftTarget }
            }));
        }
    }, [localName, group.type, group.names, layers, liftTarget, onItemSerialized, index, serializeGroup]);

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
                            onDelete={() => deleteLayer(i)}
                            modelNames={modelNames}
                            onNamesChange={(newNames) => {
                                setLayers(prev => prev.map((f, j) =>
                                    j === i ? { ...f, names: newNames } : f
                                ));
                            }}
                            onInvestigate={() => handleInvestigate(i)}
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