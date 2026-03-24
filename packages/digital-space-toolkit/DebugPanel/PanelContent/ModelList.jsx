import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';
import TextInputBox from '../CommonComponent/TextInputBox';
import EnumSelect from '../CommonComponent/EnumSelect';
import { eventChannelHub, CONTROL_CHANNELS } from '../../EventChannelHub';
import { MODEL_TYPE } from '../../SceneTypeEnum';
import sceneObjectRegistry from '../../DigitalScene/SceneObjectRegistry';
import { parseTagName } from '../../DigitalScene/DigitalModel/FrameModel';

const sanitizeVector = (vec) => {
    if (!vec) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(vec)) return { x: vec[0], y: vec[1], z: vec[2] };
    return {
        x: vec.x || 0,
        y: vec.y || 0,
        z: vec.z || 0
    };
};

const useModelItemState = ({ model, index, onItemSerialized }) => {
    const [localName, setLocalName] = useState(model.name || '');
    const [uuid, setUuid] = useState(null);
    const [visible, setVisible] = useState(true);
    const [localData, setLocalData] = useState({
        position: sanitizeVector(model.position),
        rotation: sanitizeVector(model.rotation),
        scale: typeof model.scale === 'number'
            ? { x: model.scale, y: model.scale, z: model.scale }
            : sanitizeVector(model.scale),
        file_location: model.file_location || ''
    });

    // Resolve uuid from registry by name (runs once on mount, retries briefly)
    useEffect(() => {
        const resolve = () => {
            const entry = sceneObjectRegistry.findByName(model.name);
            if (entry) {
                setUuid(entry.uuid);
                return true;
            }
            return false;
        };
        if (resolve()) return;
        // Retry for a short window while Three.js objects mount
        const interval = setInterval(() => {
            if (resolve()) clearInterval(interval);
        }, 200);
        const timeout = setTimeout(() => clearInterval(interval), 3000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [model.name]);

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

    const publish = useCallback((property, value) => {
        if (!uuid) return;
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, { uuid, property, value });
    }, [uuid]);

    const handleNameChange = useCallback((newName) => {
        publish('name', newName);
        // Update registry data so findByName stays consistent
        if (uuid) sceneObjectRegistry.updateData(uuid, { ...sceneObjectRegistry.getData(uuid), name: newName });
        setLocalName(newName);
    }, [publish, uuid]);

    const handleValueChange = useCallback((property) => (newValue) => {
        publish(property, newValue);
        setLocalData(prev => ({ ...prev, [property]: newValue }));
    }, [publish]);

    const handleVisibilityToggle = useCallback(() => {
        const newVisible = !visible;
        setVisible(newVisible);
        publish('visible', newVisible);
    }, [visible, publish]);

    const handlePrint = useCallback(() => {
        if (uuid) eventChannelHub.publish(CONTROL_CHANNELS.PRINT_OBJECT, { uuid });
    }, [uuid]);

    return {
        localName,
        setLocalName,
        uuid,
        visible,
        localData,
        setLocalData,
        handleNameChange,
        handleValueChange,
        handleVisibilityToggle,
        handlePrint
    };
};

const BaseModelItem = ({ model, index, onItemSerialized, onDelete }) => {
    const {
        localName,
        visible,
        localData,
        setLocalData,
        handleNameChange,
        handleValueChange,
        handleVisibilityToggle,
        handlePrint
    } = useModelItemState({ model, index, onItemSerialized });

    return (
        <DebugBlock
            title={localName || `Model ${index}`}
            type={model.type}
            onTitleChange={handleNameChange}
            onDelete={onDelete}
            visible={visible}
            onVisibilityToggle={handleVisibilityToggle}
            onPrint={handlePrint}
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

const FrameModelItem = ({ model, index, onItemSerialized, onDelete }) => {
    const {
        localName,
        uuid,
        visible,
        localData,
        setLocalData,
        handleNameChange,
        handleValueChange,
        handleVisibilityToggle,
        handlePrint
    } = useModelItemState({ model, index, onItemSerialized });
    const [prefixTagsMap, setPrefixTagsMap] = useState({});
    const [prefixes, setPrefixes] = useState([]);
    const [activePrefix, setActivePrefix] = useState(null);

    useEffect(() => {
        if (!uuid || model.type !== MODEL_TYPE.FRAME) return;

        const buildMapFromScene = () => {
            const threeObject = sceneObjectRegistry.getThreeObject(uuid);
            const children = threeObject?.children?.[0]?.children || [];
            if (children.length === 0) {
                return false;
            }
            const nextMap = {};
            children.forEach((child) => {
                const { prefix, tagName } = parseTagName(child.name);
                const displayTag = tagName || child.name;
                if (!displayTag) return;
                if (!nextMap[prefix]) {
                    nextMap[prefix] = [];
                }
                if (!nextMap[prefix].includes(displayTag)) {
                    nextMap[prefix].push(displayTag);
                }
            });
            const nextPrefixes = Object.keys(nextMap);
            setPrefixTagsMap(nextMap);
            setPrefixes(nextPrefixes);
            setActivePrefix((prev) => (prev && nextPrefixes.includes(prev) ? prev : null));
            return true;
        };

        if (buildMapFromScene()) return;
        const interval = setInterval(() => {
            if (buildMapFromScene()) clearInterval(interval);
        }, 200);
        const timeout = setTimeout(() => clearInterval(interval), 3000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [uuid, model.type]);

    const activeTags = activePrefix ? (prefixTagsMap[activePrefix] || []) : [];

    return (
        <DebugBlock
            title={localName || `Model ${index}`}
            type={model.type}
            onTitleChange={handleNameChange}
            onDelete={onDelete}
            visible={visible}
            onVisibilityToggle={handleVisibilityToggle}
            onPrint={handlePrint}
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
            <div className="frame-model-tag-list">
                <div className="frame-model-prefix-list">
                    {prefixes.length > 0 ? (
                        prefixes.map((prefix) => (
                            <button
                                key={prefix}
                                type="button"
                                className={`frame-model-prefix${activePrefix === prefix ? ' active' : ''}`}
                                onClick={() => setActivePrefix(prev => (prev === prefix ? null : prefix))}
                            >
                                {prefix}
                            </button>
                        ))
                    ) : (
                        <span className="frame-model-prefix-empty">No prefixes</span>
                    )}
                </div>
                {activePrefix && (
                    <div className="frame-model-bucket">
                        {activeTags.length > 0 ? (
                            activeTags.map((tag, i) => (
                                <span key={`${activePrefix}-${i}`} className="frame-model-bucket-tag">
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="frame-model-bucket-empty">No tags</span>
                        )}
                    </div>
                )}
            </div>
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

    const handleAddModel = async (newModel) => {
        try {
            const modelWithUrl = await onAddModel(newModel);
            setLocalData(prev => [...prev, modelWithUrl]);
        } catch (err) {
            throw err;
        }
    };

    const handleDeleteModel = (index) => {
        const model = localData[index];
        const updated = localData.filter((_, i) => i !== index);
        setLocalData(updated);
        const newSerialized = {};
        updated.forEach((_, i) => {
            const oldIndex = i >= index ? i + 1 : i;
            if (serializedItems[oldIndex]) {
                newSerialized[i] = serializedItems[oldIndex];
            }
        });
        setSerializedItems(newSerialized);

        // TODO: clean up group layers that reference the deleted model's uuid
        // Find uuid for the deleted model and publish with it
        const entry = sceneObjectRegistry.findByName(model.name);
        eventChannelHub.publish(CONTROL_CHANNELS.MODEL_LIST_UPDATE, {
            action: 'remove',
            name: model.name,
            uuid: entry?.uuid
        });
    };

    const handleItemSerialized = useCallback((index, data) => {
        setSerializedItems(prev => {
            const next = { ...prev, [index]: data };
            return next;
        });
    }, []);

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

    useEffect(() => {
        setSerializedItems({});
    }, [models]);

    if (localData.length === 0 && !showNewItem) {
        return <div className="debug-item no-data">No models in scene</div>;
    }

    return (
        <div className="debug-section-list">
            {showNewItem && (
                <NewModelItem onNewItemDone={onNewItemDone} onAddModel={handleAddModel} />
            )}
            {localData.map((model, index) => (
                model.type === MODEL_TYPE.FRAME ? (
                    <FrameModelItem
                        key={model.name || index}
                        model={model}
                        index={index}
                        onItemSerialized={handleItemSerialized}
                        onDelete={() => handleDeleteModel(index)}
                    />
                ) : (
                    <BaseModelItem
                        key={model.name || index}
                        model={model}
                        index={index}
                        onItemSerialized={handleItemSerialized}
                        onDelete={() => handleDeleteModel(index)}
                    />
                )
            ))}
        </div>
    );
}
