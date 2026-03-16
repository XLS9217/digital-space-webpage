/*
 * GroupList — organizer for models/lights.
 * Although level is the only group type we have now, later we will have more.
 *
 * Dispatches to type-specific components (LevelGroup, etc.) based on group.type.
 * Participates in serialization — serialized groups are included in upsert.
 */

import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock';
import EnumSelect from '../../CommonComponent/EnumSelect';
import { GROUP_TYPE } from '../../../SceneTypeEnum';
import LevelGroup from './LevelGroup';

const GROUP_COMPONENTS = {
    [GROUP_TYPE.LEVEL]: LevelGroup,
};

const NewGroupItem = ({ onNewItemDone, onAdd }) => {
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    return (
        <DebugBlock
            title={newName}
            onTitleChange={(name) => {
                setNewName(name);
                if (error) setError('');
            }}
            onDelete={onNewItemDone}
            initialExpanded={true}
            initialEditing={true}
        >
            <EnumSelect
                enumObj={GROUP_TYPE}
                onSelect={(type) => {
                    if (!newName.trim()) {
                        setError('name should not be empty');
                        return;
                    }
                    onAdd({ name: newName.trim(), type, names: [], groups: [] });
                }}
            />
            {error && <span className="enum-select-error">{error}</span>}
        </DebugBlock>
    );
};

export default function GroupList({ groups, modelNames = [], showNewItem, onNewItemDone, onSerializedUpdate, sceneController }) {
    const [localGroups, setLocalGroups] = useState([]);
    const [serializedItems, setSerializedItems] = useState({});

    useEffect(() => {
        setLocalGroups(groups || []);
    }, [groups]);

    const handleAddTopLevel = (newGroup) => {
        setLocalGroups(prev => [...prev, newGroup]);
        // Add to SceneController
        if (sceneController) {
            sceneController.addGroup(newGroup);
        }
        onNewItemDone && onNewItemDone();
    };

    const handleDeleteGroup = (index) => {
        const groupToDelete = localGroups[index];
        setLocalGroups(prev => prev.filter((_, i) => i !== index));
        // Remove from SceneController
        if (sceneController && groupToDelete) {
            sceneController.removeGroup(groupToDelete.name);
        }
    };

    const addChildToGroup = (parentName, newChild) => {
        const addRecursive = (list) =>
            list.map(g => {
                if (g.name === parentName) {
                    return { ...g, groups: [...(g.groups || []), newChild] };
                }
                if (g.groups && g.groups.length > 0) {
                    return { ...g, groups: addRecursive(g.groups) };
                }
                return g;
            });
        setLocalGroups(prev => addRecursive(prev));
    };

    const deleteChild = (parentName, childType, childIndex) => {
        const removeRecursive = (list) =>
            list.map(g => {
                if (g.name === parentName) {
                    if (childType === 'name') {
                        return { ...g, names: g.names.filter((_, i) => i !== childIndex) };
                    }
                    if (childType === 'group') {
                        return { ...g, groups: g.groups.filter((_, i) => i !== childIndex) };
                    }
                }
                if (g.groups && g.groups.length > 0) {
                    return { ...g, groups: removeRecursive(g.groups) };
                }
                return g;
            });
        setLocalGroups(prev => removeRecursive(prev));
    };

    // Recursive serialization function
    const serializeGroup = useCallback((group) => {
        const serialized = {
            name: group.name,
            type: group.type,
            names: group.names || [],
            groups: (group.groups || []).map(subGroup => serializeGroup(subGroup))
        };
        if (group.metadata) {
            serialized.metadata = group.metadata;
        }
        return serialized;
    }, []);

    const handleItemSerialized = useCallback((index, data) => {
        setSerializedItems(prev => ({ ...prev, [index]: data }));
    }, []);

    // Notify parent with full serialized array
    useEffect(() => {
        if (!onSerializedUpdate) return;
        if (localGroups.length === 0) {
            onSerializedUpdate([]);
            return;
        }
        const keys = Object.keys(serializedItems);
        if (keys.length === localGroups.length) {
            const arr = localGroups.map((_, i) => serializedItems[i]).filter(Boolean);
            onSerializedUpdate(arr);
        }
    }, [serializedItems, localGroups, onSerializedUpdate]);

    // Reset serialized items when groups prop changes externally
    useEffect(() => {
        setSerializedItems({});
    }, [groups]);

    const renderGroup = (group, depth, onDelete, index) => {
        const Component = GROUP_COMPONENTS[group.type] || LevelGroup;
        return (
            <Component
                key={group.name + depth}
                group={group}
                depth={depth}
                index={index}
                onDelete={onDelete}
                onAddChild={addChildToGroup}
                onDeleteChild={deleteChild}
                serializeGroup={serializeGroup}
                modelNames={modelNames}
                onItemSerialized={handleItemSerialized}
                sceneController={sceneController}
            />
        );
    };

    if (localGroups.length === 0 && !showNewItem) {
        return <div className="debug-item no-data">No groups in scene</div>;
    }

    return (
        <div className="debug-section-list">
            {showNewItem && (
                <NewGroupItem onNewItemDone={onNewItemDone} onAdd={handleAddTopLevel} />
            )}
            {localGroups.map((group, index) =>
                renderGroup(group, 0, () => handleDeleteGroup(index), index)
            )}
        </div>
    );
}