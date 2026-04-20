import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';
import BarHandle from '../CommonComponent/BarHandle';
import ColorPicker from '../CommonComponent/ColorPicker';
import CheckBox from '../CommonComponent/CheckBox';
import EnumSelect from '../CommonComponent/EnumSelect';
import TextInputBox from '../CommonComponent/TextInputBox';
import { eventChannelHub, CONTROL_CHANNELS, DEBUG_SCENE_CHANNELS } from '../../EventChannelHub';
import { LIGHT_TYPE } from '../../SceneTypeEnum';
import sceneObjectRegistry from '../../DigitalScene/SceneObjectRegistry';

const sanitizeVector = (vec) => {
    if (!vec) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(vec)) return { x: vec[0], y: vec[1], z: vec[2] };
    return {
        x: vec.x || 0,
        y: vec.y || 0,
        z: vec.z || 0
    };
};

const LightItem = ({ light, index, onItemSerialized, onDelete }) => {
    const [localName, setLocalName] = useState(light.name || '');
    const [uuid, setUuid] = useState(null);
    const [visible, setVisible] = useState(true);
    const [showHelper, setShowHelper] = useState(false);
    const [realtimeAdvanced, setRealtimeAdvanced] = useState(null);

    const isDirectional = light.type === LIGHT_TYPE.DIRECTIONAL;

    // Support both old (flat) and new (advanced) structure
    const getPosition = () => {
        if (isDirectional) {
            if (light.advanced?.position) return sanitizeVector(light.advanced.position);
            if (light.position) return sanitizeVector(light.position);
            return { x: 10, y: 10, z: 10 };
        }
        return light.position ? sanitizeVector(light.position) : undefined;
    };

    const getTarget = () => {
        if (isDirectional) {
            if (light.advanced?.target) return sanitizeVector(light.advanced.target);
            if (light.target) return sanitizeVector(light.target);
            return { x: 0, y: 0, z: 0 };
        }
        return undefined;
    };

    const [localData, setLocalData] = useState({
        intensity: light.intensity || 0,
        position: getPosition(),
        target: getTarget(),
        color: light.color || '#ffffff'
    });

    // Resolve uuid from registry
    useEffect(() => {
        const resolve = () => {
            const entry = sceneObjectRegistry.findByName(light.name);
            if (entry) {
                setUuid(entry.uuid);
                return true;
            }
            return false;
        };
        if (resolve()) return;
        const interval = setInterval(() => {
            if (resolve()) clearInterval(interval);
        }, 200);
        const timeout = setTimeout(() => clearInterval(interval), 3000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [light.name]);

    // Sync from props when light changes externally
    useEffect(() => {
        setLocalName(light.name || '');
        const isDir = light.type === LIGHT_TYPE.DIRECTIONAL;

        const getPos = () => {
            if (isDir) {
                if (light.advanced?.position) return sanitizeVector(light.advanced.position);
                if (light.position) return sanitizeVector(light.position);
                return { x: 10, y: 10, z: 10 };
            }
            return light.position ? sanitizeVector(light.position) : undefined;
        };

        const getTgt = () => {
            if (isDir) {
                if (light.advanced?.target) return sanitizeVector(light.advanced.target);
                if (light.target) return sanitizeVector(light.target);
                return { x: 0, y: 0, z: 0 };
            }
            return undefined;
        };

        setLocalData({
            intensity: light.intensity || 0,
            position: getPos(),
            target: getTgt(),
            color: light.color || '#ffffff'
        });
    }, [light]);

    // Notify parent whenever local data changes
    useEffect(() => {
        if (onItemSerialized) {
            const serialized = {
                name: localName,
                type: light.type,
                intensity: localData.intensity,
                color: localData.color
            };

            // Use new structure with advanced object for directional lights
            if (isDirectional && (localData.position || localData.target)) {
                serialized.advanced = {};
                if (localData.position) serialized.advanced.position = localData.position;
                if (localData.target) serialized.advanced.target = localData.target;
            }

            onItemSerialized(index, serialized);
        }
    }, [localData, localName, index, light.type, isDirectional, onItemSerialized]);

    const publish = useCallback((property, value) => {
        if (!uuid) return;
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, { uuid, property, value });
    }, [uuid]);

    const handleNameChange = useCallback((newName) => {
        publish('name', newName);
        if (uuid) sceneObjectRegistry.updateData(uuid, { ...sceneObjectRegistry.getData(uuid), name: newName });
        setLocalName(newName);
    }, [publish, uuid]);

    const handlePropertyChange = useCallback((property) => (newValue) => {
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

    const handleHelperToggle = useCallback((checked) => {
        setShowHelper(checked);
        if (uuid) {
            eventChannelHub.publish(CONTROL_CHANNELS.LIGHT_HELPER_TOGGLE, {
                uuid,
                showHelper: checked
            });
        }
    }, [uuid]);

    // Subscribe to feedback from 3D gizmo (matched by uuid)
    useEffect(() => {
        const handleFeedback = ({ uuid: feedbackUuid, property, value }) => {
            if (feedbackUuid !== uuid) return;

            if (property === 'position' || property === 'target') {
                setLocalData(prev => ({ ...prev, [property]: value }));
            } else if (property === 'advanced') {
                setRealtimeAdvanced(value);
            }
        };

        eventChannelHub.subscribe(DEBUG_SCENE_CHANNELS.LIGHT_PROPERTY_FEEDBACK, handleFeedback);
        return () => {
            eventChannelHub.unsubscribe(DEBUG_SCENE_CHANNELS.LIGHT_PROPERTY_FEEDBACK, handleFeedback);
        };
    }, [uuid]);

    return (
        <DebugBlock
            title={localName || `Light ${index} NO name`}
            type={light.type}
            onTitleChange={handleNameChange}
            onDelete={onDelete}
            visible={visible}
            onVisibilityToggle={handleVisibilityToggle}
            onPrint={handlePrint}
        >
            <BarHandle
                label="Intensity"
                value={localData.intensity}
                min={0}
                max={3}
                step={0.01}
                editable={true}
                onValueChange={handlePropertyChange('intensity')}
            />
            {isDirectional && (
                <>
                    <CoordDisplayer
                        label="Pos"
                        value={localData.position}
                        editable={true}
                        onValueChange={handlePropertyChange('position')}
                    />
                    <CoordDisplayer
                        label="Target"
                        value={localData.target}
                        editable={true}
                        onValueChange={handlePropertyChange('target')}
                    />
                    <CheckBox
                        label="Camera Helper"
                        checked={showHelper}
                        onChange={handleHelperToggle}
                    />
                    {realtimeAdvanced && (
                        <DebugBlock
                            title="Advanced (Real-time)"
                            initialExpanded={false}
                            isNested={true}
                        >
                            <TextInputBox
                                label="shadowCameraFar"
                                value={realtimeAdvanced.shadowCameraFar}
                                editable={false}
                            />
                            <TextInputBox
                                label="shadowCameraLeft"
                                value={realtimeAdvanced.shadowCameraLeft}
                                editable={false}
                            />
                            <TextInputBox
                                label="shadowCameraRight"
                                value={realtimeAdvanced.shadowCameraRight}
                                editable={false}
                            />
                            <TextInputBox
                                label="shadowCameraTop"
                                value={realtimeAdvanced.shadowCameraTop}
                                editable={false}
                            />
                            <TextInputBox
                                label="shadowCameraBottom"
                                value={realtimeAdvanced.shadowCameraBottom}
                                editable={false}
                            />
                            <TextInputBox
                                label="shadowMapSize"
                                value={realtimeAdvanced.shadowMapSize}
                                editable={false}
                            />
                        </DebugBlock>
                    )}
                </>
            )}
            <ColorPicker
                label="Color"
                value={localData.color}
                editable={true}
                onValueChange={handlePropertyChange('color')}
            />
        </DebugBlock>
    );
};

const createDefaultLight = (type, name) => {
    switch (type) {
        case LIGHT_TYPE.AMBIENT:
            return { name, type, intensity: 1, color: '#ffffff' };
        case LIGHT_TYPE.DIRECTIONAL:
            return {
                name,
                type,
                intensity: 1,
                color: '#ffffff',
                position: { x: 10, y: 10, z: 10 },
                target: { x: 0, y: 0, z: 0 }
            };
        default:
            return { name, type, intensity: 1, color: '#ffffff' };
    }
};

const NewLightItem = ({ onNewItemDone, onAddLight }) => {
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    return (
        <DebugBlock
            title={newName}
            onTitleChange={(name) => {
                setNewName(name);
                if (name.trim()) setError('');
            }}
            onDelete={onNewItemDone}
            initialExpanded={true}
            initialEditing={true}
        >
            <EnumSelect
                enumObj={LIGHT_TYPE}
                onSelect={(type) => {
                    if (!newName.trim()) {
                        setError('name should not be empty');
                        return;
                    }
                    onAddLight(createDefaultLight(type, newName.trim()));
                    onNewItemDone();
                }}
            />
            {error && <span className="enum-select-error">{error}</span>}
        </DebugBlock>
    );
};

export default function LightList({ lights, onSerializedUpdate, showNewItem, onNewItemDone }) {
    const [localLights, setLocalLights] = useState([]);
    const [serializedItems, setSerializedItems] = useState({});

    useEffect(() => {
        setLocalLights(lights || []);
    }, [lights]);

    const handleAddLight = (light) => {
        const updated = [...localLights, light];
        setLocalLights(updated);
        eventChannelHub.publish(CONTROL_CHANNELS.LIGHT_LIST_UPDATE, {
            action: 'add',
            light
        });
    };

    const handleDeleteLight = (index) => {
        const updated = localLights.filter((_, i) => i !== index);
        setLocalLights(updated);
        const newSerialized = {};
        updated.forEach((_, i) => {
            const oldIndex = i >= index ? i + 1 : i;
            if (serializedItems[oldIndex]) {
                newSerialized[i] = serializedItems[oldIndex];
            }
        });
        setSerializedItems(newSerialized);
        eventChannelHub.publish(CONTROL_CHANNELS.LIGHT_LIST_UPDATE, {
            action: 'remove',
            index
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
        if (localLights.length === 0) {
            onSerializedUpdate([]);
            return;
        }
        const keys = Object.keys(serializedItems);
        if (keys.length === localLights.length) {
            const arr = localLights.map((_, i) => serializedItems[i]).filter(Boolean);
            onSerializedUpdate(arr);
        }
    }, [serializedItems, localLights, onSerializedUpdate]);

    useEffect(() => {
        setSerializedItems({});
    }, [lights]);

    if (localLights.length === 0 && !showNewItem) {
        return <div className="debug-item no-data">No lights in scene</div>;
    }

    return (
        <div className="debug-section-list">
            {showNewItem && (
                <NewLightItem onNewItemDone={onNewItemDone} onAddLight={handleAddLight} />
            )}
            {localLights.map((light, index) => (
                <LightItem
                    key={light.name || index}
                    light={light}
                    index={index}
                    onItemSerialized={handleItemSerialized}
                    onDelete={() => handleDeleteLight(index)}
                />
            ))}
        </div>
    );
}
