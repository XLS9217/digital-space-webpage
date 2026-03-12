/*
 * GroupList — display-only organizer for models/lights.
 * Although level is the only group type we have now, later we will have more.
 * Does NOT participate in 3D logic or serialized scene JSON yet.
 *
 * Dispatches to type-specific components (LevelGroup, etc.) based on group.type.
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

export default function GroupList({ groups, modelNames = [], showNewItem, onNewItemDone }) {
    const [localGroups, setLocalGroups] = useState([]);

    useEffect(() => {
        setLocalGroups(groups || []);
    }, [groups]);

    const handleAddTopLevel = (newGroup) => {
        setLocalGroups(prev => [...prev, newGroup]);
        onNewItemDone && onNewItemDone();
    };

    const handleDeleteGroup = (index) => {
        setLocalGroups(prev => prev.filter((_, i) => i !== index));
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
        return {
            name: group.name,
            type: group.type,
            names: group.names || [],
            groups: (group.groups || []).map(subGroup => serializeGroup(subGroup))
        };
    }, []);

    const renderGroup = (group, depth, onDelete) => {
        const Component = GROUP_COMPONENTS[group.type] || LevelGroup;
        return (
            <Component
                key={group.name + depth}
                group={group}
                depth={depth}
                onDelete={onDelete}
                onAddChild={addChildToGroup}
                onDeleteChild={deleteChild}
                serializeGroup={serializeGroup}
                modelNames={modelNames}
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
                renderGroup(group, 0, () => handleDeleteGroup(index))
            )}
        </div>
    );
}