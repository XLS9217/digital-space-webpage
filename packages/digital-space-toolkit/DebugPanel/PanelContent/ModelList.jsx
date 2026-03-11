import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';
import TextInputBox from '../CommonComponent/TextInputBox';
import EnumSelect from '../CommonComponent/EnumSelect';
import { eventChannelHub, CONTROL_CHANNELS } from '../../EventChannelHub';
import { MODEL_TYPE } from '../../SceneTypeEnum';

const sanitizeVector = (vec) => {
    if (!vec) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(vec)) return { x: vec[0], y: vec[1], z: vec[2] };
    return {
        x: vec.x || 0,
        y: vec.y || 0,
        z: vec.z || 0
    };
};

const ModelItem = ({ model, index, onItemSerialized, onDelete }) => {
    const [localName, setLocalName] = useState(model.name || '');
    const [visible, setVisible] = useState(true);
    const [localData, setLocalData] = useState({
        position: sanitizeVector(model.position),
        rotation: sanitizeVector(model.rotation),
        scale: typeof model.scale === 'number'
            ? { x: model.scale, y: model.scale, z: model.scale }
            : sanitizeVector(model.scale),
        file_location: model.file_location || ''
    });

    // Sync from props when model changes externally
    useEffect(() => {
        setLocalName(model.name || '');
        setLocalData({
            position: sanitizeVector(model.position),
            rotation: sanitizeVector(model.rotation),
            scale: typeof model.scale === 'number'
                ? { x: model.scale, y: model.scale, z: model.scale }
                : sanitizeVector(model.scale),
            file_location: model.file_location || ''
        });
    }, [model]);

    // Notify parent whenever local data changes
    useEffect(() => {
        if (onItemSerialized) {
            onItemSerialized(index, {
                name: localName,
                type: model.type,
                ...localData
            });
        }
    }, [localData, localName, index, model.type, onItemSerialized]);

    const handleValueChange = useCallback((property) => (newValue) => {
        // Publish to 3D engine
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
            name: model.name,
            property: property,
            value: newValue
        });
        // Update local state
        setLocalData(prev => ({
            ...prev,
            [property]: newValue
        }));
    }, [model.name]);

    const handleVisibilityToggle = useCallback(() => {
        const newVisible = !visible;
        setVisible(newVisible);
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
            name: model.name,
            property: 'visible',
            value: newVisible
        });
    }, [model.name, visible]);

    return (
        <DebugBlock
            title={localName || `Model ${index}`}
            type={model.type}
            onTitleChange={(newName) => setLocalName(newName)}
            onDelete={onDelete}
            visible={visible}
            onVisibilityToggle={handleVisibilityToggle}
        >
            <CoordDisplayer
                label="Pos"
                value={localData.position}
                editable={true}
                onValueChange={handleValueChange('position')}
            />
            <CoordDisplayer
                label="Rot"
                value={localData.rotation}
                editable={true}
                onValueChange={handleValueChange('rotation')}
            />
            <CoordDisplayer
                label="Scale"
                value={localData.scale}
                editable={true}
                onValueChange={handleValueChange('scale')}
            />
            <TextInputBox
                label="File"
                value={localData.file_location}
                editable={true}
                onValueChange={(newValue) => {
                    setLocalData(prev => ({ ...prev, file_location: newValue }));
                }}
            />
        </DebugBlock>
    );
};

const NewModelItem = ({ onNewItemDone, onAddModel }) => {
    const [newName, setNewName] = useState('');
    const [fileLocation, setFileLocation] = useState('');
    const [error, setError] = useState('');

    const validate = () => {
        if (!newName.trim() && !fileLocation.trim()) {
            return 'name and file should not be empty';
        }
        if (!newName.trim()) return 'name should not be empty';
        if (!fileLocation.trim()) return 'file should not be empty';
        return '';
    };

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
                enumObj={MODEL_TYPE}
                onSelect={async (type) => {
                    const msg = validate();
                    if (msg) {
                        setError(msg);
                        return;
                    }
                    try {
                        await onAddModel({
                            name: newName.trim(),
                            type,
                            file_location: fileLocation.trim()
                        });
                        onNewItemDone();
                    } catch (err) {
                        setError('upsert failed: ' + (err.response?.data?.error || err.message));
                    }
                }}
            />
            <TextInputBox
                label="File"
                value={fileLocation}
                editable={true}
                onValueChange={(val) => {
                    setFileLocation(val);
                    if (error) setError('');
                }}
            />

            {error && <span className="enum-select-error">{error}</span>}
        </DebugBlock>
    );
};

export default function ModelList({ models, onSerializedUpdate, showNewItem, onNewItemDone, onAddModel }) {
    const [localData, setLocalData] = useState([]);
    const [serializedItems, setSerializedItems] = useState({});

    // Sync from props when models change externally
    useEffect(() => {
        setLocalData(models || []);
    }, [models]);

    const handleDeleteModel = (index) => {
        const model = localData[index];
        const updated = localData.filter((_, i) => i !== index);
        setLocalData(updated);
        // Re-index serialized items to match new array
        const newSerialized = {};
        updated.forEach((_, i) => {
            const oldIndex = i >= index ? i + 1 : i;
            if (serializedItems[oldIndex]) {
                newSerialized[i] = serializedItems[oldIndex];
            }
        });
        setSerializedItems(newSerialized);
        eventChannelHub.publish(CONTROL_CHANNELS.MODEL_LIST_UPDATE, {
            action: 'remove',
            name: model.name
        });
    };

    const handleItemSerialized = useCallback((index, data) => {
        setSerializedItems(prev => {
            const next = { ...prev, [index]: data };
            return next;
        });
    }, []);

    // When serialized items change, notify parent with the full array
    useEffect(() => {
        if (!onSerializedUpdate) return;
        if (localData.length === 0) {
            onSerializedUpdate([]);
            return;
        }
        const keys = Object.keys(serializedItems);
        if (keys.length === localData.length) {
            const arr = localData.map((_, i) => serializedItems[i]).filter(Boolean);
            onSerializedUpdate(arr);
        }
    }, [serializedItems, localData, onSerializedUpdate]);

    // Reset serialized items when models prop changes externally
    useEffect(() => {
        setSerializedItems({});
    }, [models]);

    if (localData.length === 0 && !showNewItem) {
        return <div className="debug-item no-data">No models in scene</div>;
    }

    return (
        <div className="debug-section-list">
            {showNewItem && (
                <NewModelItem onNewItemDone={onNewItemDone} onAddModel={onAddModel} />
            )}
            {localData.map((model, index) => (
                <ModelItem
                    key={model.name || index}
                    model={model}
                    index={index}
                    onItemSerialized={handleItemSerialized}
                    onDelete={() => handleDeleteModel(index)}
                />
            ))}
        </div>
    );
}
