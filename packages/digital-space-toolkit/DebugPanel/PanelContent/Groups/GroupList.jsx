/*
 * GroupList — organizer for models/lights.
 * Groups store uuids[] internally. On serialization for upsert,
 * uuids are resolved back to names via SceneObjectRegistry.
 */

import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../../CommonComponent/DebugBlock';
import EnumSelect from '../../CommonComponent/EnumSelect';
import { GROUP_TYPE } from '../../../SceneTypeEnum';
import sceneObjectRegistry from '../../../DigitalScene/SceneObjectRegistry';
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
                    onAdd({ name: newName.trim(), type, uuids: [], groups: [] });
                }}
            />
            {error && <span className="enum-select-error">{error}</span>}
        </DebugBlock>
    );
};

export default function GroupList({ groups, modelEntries = [], showNewItem, onNewItemDone, onSerializedUpdate, sceneController }) {
    const [localGroups, setLocalGroups] = useState([]);
    const [serializedItems, setSerializedItems] = useState({});

    // Migrate backend names[] → uuids[] when groups load
    useEffect(() => {
        const migrateGroup = (g) => {
            const migrated = { ...g };
            // Convert names[] to uuids[] if present
            if (g.names && g.names.length > 0 && (!g.uuids || g.uuids.length === 0)) {
                migrated.uuids = g.names.map(name => {
                    const entry = sceneObjectRegistry.findByName(name);
                    return entry?.uuid || name; // keep name as fallback if not yet registered
                });
            }
            if (g.groups) {
                migrated.groups = g.groups.map(sub => migrateGroup(sub));
            }
            return migrated;
        };
        setLocalGroups((groups || []).map(migrateGroup));
    }, [groups]);

    const handleAddTopLevel = (newGroup) => {
        setLocalGroups(prev => [...prev, newGroup]);
        if (sceneController) {
            sceneController.addGroup(newGroup);
        }
        onNewItemDone && onNewItemDone();
    };

    const handleDeleteGroup = (index) => {
        const groupToDelete = localGroups[index];
        setLocalGroups(prev => prev.filter((_, i) => i !== index));
        if (sceneController && groupToDelete) {
            sceneController.removeGroup(groupToDelete.name);
        }
    };

    // Recursive serialization — converts uuids[] → names[] for backend.
    // If group already has names[] (already serialized child), preserves them.
    const serializeGroup = useCallback((group) => {
        const uuids = group.uuids || [];
        let names;
        if (uuids.length > 0) {
            names = uuids.map(uuid => {
                const data = sceneObjectRegistry.getData(uuid);
                return data?.name || uuid;
            });
        } else {
            names = group.names || [];
        }

        const serialized = {
            name: group.name,
            type: group.type,
            names,
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
                serializeGroup={serializeGroup}
                modelEntries={modelEntries}
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
