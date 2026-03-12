/*
 * LevelGroup — group type "level"
 * Represents a floor/level that contains model/light names and nested floor sub-groups.
 * FloorGroup is a leaf node — no further nesting allowed.
 */

import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock';
import TagList from '../../CommonComponent/TagList';
import { GROUP_TYPE } from '../../../SceneTypeEnum';

const FloorGroup = ({ group, depth = 0, onDelete, onNamesChange, modelNames }) => {
    return (
        <div style={{ marginLeft: depth > 0 ? 12 : 0 }}>
            <DebugBlock
                title={group.name || 'Unnamed Floor'}
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
            </DebugBlock>
        </div>
    );
};

const LevelGroup = ({ group, depth = 0, onDelete, serializeGroup, modelNames = [] }) => {
    const [localName, setLocalName] = useState(group.name || '');
    const [floors, setFloors] = useState(group.groups || []);

    useEffect(() => {
        setLocalName(group.name || '');
    }, [group]);

    // Initialize with default floor "1" if no floors exist
    useEffect(() => {
        if (!group.groups || group.groups.length === 0) {
            setFloors([{
                name: '1',
                type: GROUP_TYPE.LEVEL.FLOOR,
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
                type: GROUP_TYPE.LEVEL.FLOOR,
                names: [],
                groups: []
            };
            return atEnd ? [...prev, newFloor] : [newFloor, ...prev];
        });
    };

    const deleteFloor = (index) => {
        setFloors(prev => prev.filter((_, i) => i !== index));
    };

    const handlePrint = useCallback(() => {
        // Build current state for serialization
        const currentGroup = {
            name: localName,
            type: group.type,
            names: group.names || [],
            groups: floors
        };
        const serialized = serializeGroup(currentGroup);
        console.log('Level Group Serialized:', serialized);
    }, [localName, group.type, group.names, floors, serializeGroup]);

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
                        title="Add floor to top"
                    >+</span>
                    {floors.map((child, i) => (
                        <FloorGroup
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
                        />
                    ))}
                    <span
                        className="floor-insert-btn"
                        onClick={() => addFloor(true)}
                        title="Add floor to bottom"
                    >+</span>
                </div>
            </DebugBlock>
        </div>
    );
};

export default LevelGroup;