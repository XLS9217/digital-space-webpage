/*
 * LevelGroup — group type "level"
 * Represents a floor/level that contains model/light names and nested floor sub-groups.
 * FloorGroup is a leaf node — no further nesting allowed.
 */

import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock';
import { TrashBinIcon } from '../../CodeSvg';
import { GROUP_TYPE } from '../../../SceneTypeEnum';

const FloorGroup = ({ group, depth = 0, onDeleteChild, onDelete }) => {
    return (
        <div style={{ marginLeft: depth > 0 ? 12 : 0 }} className="floor-group">
            <div className="floor-group-header">
                <span className="floor-group-name">{group.name || 'Unnamed Floor'}</span>
                <div className="floor-group-header-right">
                    <span className="debug-section-type">{group.type}</span>
                    {onDelete && (
                        <TrashBinIcon size={14} onClick={onDelete} title="Delete floor" />
                    )}
                </div>
            </div>
            {group.names && group.names.length > 0 && (
                <div className="group-names-list">
                    {group.names.map((name, i) => (
                        <div key={name + i} className="group-name-entry">
                            <span className="group-name-text">{name}</span>
                            <span
                                className="group-name-remove"
                                onClick={() => onDeleteChild && onDeleteChild(group.name, 'name', i)}
                                title="Remove"
                            >
                                &times;
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const LevelGroup = ({ group, depth = 0, onDelete, onDeleteChild }) => {
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

    const serializeGroup = useCallback(() => {
        return {
            name: localName,
            type: group.type,
            names: group.names || [],
            groups: floors.map(floor => ({
                name: floor.name,
                type: floor.type,
                names: floor.names || [],
                groups: floor.groups || []
            }))
        };
    }, [localName, group.type, group.names, floors]);

    const handlePrint = useCallback(() => {
        const serialized = serializeGroup();
        console.log('Level Group Serialized:', JSON.stringify(serialized, null, 2));
    }, [serializeGroup]);

    return (
        <div style={{ marginLeft: depth > 0 ? 12 : 0 }}>
            <DebugBlock
                title={localName || 'Unnamed Level'}
                type={group.type}
                onTitleChange={(newName) => setLocalName(newName)}
                onDelete={onDelete}
                onPrint={handlePrint}
            >
                {group.names && group.names.length > 0 && (
                    <div className="group-names-list">
                        {group.names.map((name, i) => (
                            <div key={name + i} className="group-name-entry">
                                <span className="group-name-text">{name}</span>
                                <span
                                    className="group-name-remove"
                                    onClick={() => onDeleteChild && onDeleteChild(group.name, 'name', i)}
                                    title="Remove"
                                >
                                    &times;
                                </span>
                            </div>
                        ))}
                    </div>
                )}

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
                            onDeleteChild={onDeleteChild}
                            onDelete={() => deleteFloor(i)}
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