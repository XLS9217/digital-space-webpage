import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';
import BarHandle from '../CommonComponent/BarHandle';
import EnumSelect from '../CommonComponent/EnumSelect';
import { eventChannelHub, CONTROL_CHANNELS } from '../../EventChannelHub';
import { LIGHT_TYPE } from '../../SceneTypeEnum';

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
    const [localData, setLocalData] = useState({
        intensity: light.intensity || 0,
        position: light.position ? sanitizeVector(light.position) : undefined,
        color: light.color
    });

    // Sync from props when light changes externally
    useEffect(() => {
        setLocalName(light.name || '');
        setLocalData({
            intensity: light.intensity || 0,
            position: light.position ? sanitizeVector(light.position) : undefined,
            color: light.color
        });
    }, [light]);

    // Notify parent whenever local data changes
    useEffect(() => {
        if (onItemSerialized) {
            onItemSerialized(index, {
                name: localName,
                type: light.type,
                ...localData
            });
        }
    }, [localData, localName, index, light.type, onItemSerialized]);

    const handlePropertyChange = useCallback((property) => (newValue) => {
        // Publish to 3D engine
        eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
            name: light.name,
            property: property,
            value: newValue
        });
        // Update local state
        setLocalData(prev => ({
            ...prev,
            [property]: newValue
        }));
    }, [light.name]);

    return (
        <DebugBlock
            title={localName || `Light ${index} NO name`}
            type={light.type}
            onTitleChange={(newName) => setLocalName(newName)}
            onDelete={onDelete}
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
            {localData.position && (
                <CoordDisplayer
                    label="Pos"
                    value={localData.position}
                    editable={true}
                    onValueChange={handlePropertyChange('position')}
                />
            )}
            {localData.color && (
                <div className="debug-detail-row">
                    <span className="debug-detail-label">Color:</span>
                    <span className="debug-detail-values">
                        {localData.color}
                    </span>
                </div>
            )}
        </DebugBlock>
    );
};

const NewLightItem = ({ onNewItemDone }) => {
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
                    console.log("Add light type:", type, "name:", newName);
                    onNewItemDone();
                }}
            />
            {error && <span className="enum-select-error">{error}</span>}
        </DebugBlock>
    );
};

export default function LightList({ lights, onSerializedUpdate, showNewItem, onNewItemDone }) {
    const [serializedItems, setSerializedItems] = useState({});

    const handleItemSerialized = useCallback((index, data) => {
        setSerializedItems(prev => {
            const next = { ...prev, [index]: data };
            return next;
        });
    }, []);

    // When serialized items change, notify parent with the full array
    useEffect(() => {
        if (onSerializedUpdate && lights && lights.length > 0) {
            const keys = Object.keys(serializedItems);
            if (keys.length === lights.length) {
                const arr = lights.map((_, i) => serializedItems[i]).filter(Boolean);
                onSerializedUpdate(arr);
            }
        }
    }, [serializedItems, lights, onSerializedUpdate]);

    // Reset serialized items when lights array changes identity
    useEffect(() => {
        setSerializedItems({});
    }, [lights]);

    if (!lights || lights.length === 0) {
        return <div className="debug-item no-data">No lights in scene</div>;
    }

    return (
        <div className="debug-section-list">
            {showNewItem && (
                <NewLightItem onNewItemDone={onNewItemDone} />
            )}
            {lights.map((light, index) => (
                <LightItem
                    key={light.name || index}
                    light={light}
                    index={index}
                    onItemSerialized={handleItemSerialized}
                    onDelete={() => console.log("Delete light:", light.name, index)}
                />
            ))}
        </div>
    );
}
