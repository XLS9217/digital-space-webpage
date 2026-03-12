/*
 * LevelGroup — group type "level"
 * Represents a level that contains named layers (sub-groups).
 * LayerGroup is a leaf node — no further nesting allowed.
 */

import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock';
import DebugButton from '../../CommonComponent/DebugButton';
import TagList from '../../CommonComponent/TagList';
import { GROUP_TYPE } from '../../../SceneTypeEnum';
import { eventChannelHub, CONTROL_CHANNELS } from '../../../EventChannelHub';

const LayerGroup = ({ group, depth = 0, onDelete, onNamesChange, modelNames, onExplode }) => {
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
                    onClick={onExplode}
                    title="Bring this layer to the top of the stack"
                />
            </DebugBlock>
        </div>
    );
};

const LevelGroup = ({ group, depth = 0, onDelete, serializeGroup, modelNames = [], onItemSerialized, index }) => {
    const [localName, setLocalName] = useState(group.name || '');
    const [floors, setFloors] = useState(group.groups || []);
    const [liftedLayers, setLiftedLayers] = useState(new Set());

    useEffect(() => {
        setLocalName(group.name || '');
    }, [group]);

    // Initialize with default layer "1" if no layers exist
    useEffect(() => {
        if (!group.groups || group.groups.length === 0) {
            setFloors([{
                name: '1',
                type: GROUP_TYPE.LEVEL.LAYER,
                names: [],
                groups: []
            }]);
        }
    }, []);

    const addFloor = (atEnd) => {
        setFloors(prev => {
            // Get current floor numbers
            const floorNumbers = prev.map(f => parseInt(f.name) || 0);
            const maxFloor = Math.max(...floorNumbers);
            const minFloor = Math.min(...floorNumbers);

            const newFloor = {
                name: String(atEnd ? minFloor - 1 : maxFloor + 1),
                type: GROUP_TYPE.LEVEL.LAYER,
                names: [],
                groups: []
            };
            return atEnd ? [...prev, newFloor] : [newFloor, ...prev];
        });
    };

    const deleteFloor = (index) => {
        setFloors(prev => prev.filter((_, i) => i !== index));
    };

    const handleInvestigate = useCallback((layerIndex) => {
        // Layers above the clicked one (lower index = higher floor) - should be lifted
        const layersAbove = floors.slice(0, layerIndex);
        // Layers at or below the clicked one - should be at ground level
        const layersAtOrBelow = floors.slice(layerIndex);

        // Find layers above that need to be lifted
        const layersToLift = layersAbove
            .map((layer, index) => ({ layer, index }))
            .filter(({ index }) => !liftedLayers.has(index));

        // Find layers at or below that need to be brought down
        const layersToBringDown = layersAtOrBelow
            .map((layer, index) => ({ layer, index: index + layerIndex }))
            .filter(({ index }) => liftedLayers.has(index));

        // Lift layers above
        const namesToLift = layersToLift.flatMap(({ layer }) => layer.names || []);
        namesToLift.forEach(name => {
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                name,
                property: 'position',
                value: { x: 0, y: 50, z: 0 },
                relative: true,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    console.log("success");
                }
            });
        });

        // Bring down layers at or below
        const namesToBringDown = layersToBringDown.flatMap(({ layer }) => layer.names || []);
        namesToBringDown.forEach(name => {
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_ANIMATION, {
                name,
                property: 'position',
                value: { x: 0, y: -50, z: 0 },
                relative: true,
                duration: 1,
                ease: "power2.out",
                onComplete: () => {
                    console.log("success");
                }
            });
        });

        // Update lifted layers state
        setLiftedLayers(prev => {
            const newSet = new Set(prev);
            // Add lifted layers
            layersToLift.forEach(({ index }) => newSet.add(index));
            // Remove brought down layers
            layersToBringDown.forEach(({ index }) => newSet.delete(index));
            return newSet;
        });
    }, [floors, liftedLayers]);

    const handlePrint = useCallback(() => {
        const currentGroup = {
            name: localName,
            type: group.type,
            names: group.names || [],
            groups: floors
        };
        const serialized = serializeGroup(currentGroup);
        console.log('Level Group Serialized:', serialized);
    }, [localName, group.type, group.names, floors, serializeGroup]);

    // Notify parent with serialized state
    useEffect(() => {
        if (onItemSerialized) {
            onItemSerialized(index, serializeGroup({
                name: localName,
                type: group.type,
                names: group.names || [],
                groups: floors
            }));
        }
    }, [localName, group.type, group.names, floors, onItemSerialized, index, serializeGroup]);

    return (
        <div style={{ marginLeft: depth > 0 ? 12 : 0 }}>
            <DebugBlock
                title={localName || 'Unnamed Level'}
                type={group.type}
                onTitleChange={(newName) => setLocalName(newName)}
                onDelete={onDelete}
                onPrint={handlePrint}
            >
                <div className="floor-list">
                    <span
                        className="floor-insert-btn"
                        onClick={() => addFloor(false)}
                        title="Add layer to top"
                    >+</span>
                    {floors.map((child, i) => (
                        <LayerGroup
                            key={child.name + i}
                            group={child}
                            depth={depth + 1}
                            onDelete={() => deleteFloor(i)}
                            modelNames={modelNames}
                            onNamesChange={(newNames) => {
                                setFloors(prev => prev.map((f, j) =>
                                    j === i ? { ...f, names: newNames } : f
                                ));
                            }}
                            onExplode={() => handleInvestigate(i)}
                        />
                    ))}
                    <span
                        className="floor-insert-btn"
                        onClick={() => addFloor(true)}
                        title="Add layer to bottom"
                    >+</span>
                </div>
            </DebugBlock>
        </div>
    );
};

export default LevelGroup;