import React, { useState, useEffect, useCallback } from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';
import { eventChannelHub, CONTROL_CHANNELS } from '../../EventChannelHub';

const sanitizeVector = (vec) => {
    if (!vec) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(vec)) return { x: vec[0], y: vec[1], z: vec[2] };
    return {
        x: vec.x || 0,
        y: vec.y || 0,
        z: vec.z || 0
    };
};

const ModelItem = ({ model, index, onItemSerialized }) => {
    const [localData, setLocalData] = useState({
        position: sanitizeVector(model.position),
        rotation: sanitizeVector(model.rotation),
        scale: typeof model.scale === 'number'
            ? { x: model.scale, y: model.scale, z: model.scale }
            : sanitizeVector(model.scale)
    });

    // Sync from props when model changes externally
    useEffect(() => {
        setLocalData({
            position: sanitizeVector(model.position),
            rotation: sanitizeVector(model.rotation),
            scale: typeof model.scale === 'number'
                ? { x: model.scale, y: model.scale, z: model.scale }
                : sanitizeVector(model.scale)
        });
    }, [model]);

    // Notify parent whenever local data changes
    useEffect(() => {
        if (onItemSerialized) {
            onItemSerialized(index, {
                name: model.name,
                type: model.type,
                file_location: model.file_location,
                ...localData
            });
        }
    }, [localData, index, model.name, model.type, model.file_location, onItemSerialized]);

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

    return (
        <DebugBlock
            title={model.name || `Model ${index}`}
            type={model.type}
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
        </DebugBlock>
    );
};

export default function ModelList({ models, onSerializedUpdate }) {
    const [serializedItems, setSerializedItems] = useState({});

    const handleItemSerialized = useCallback((index, data) => {
        setSerializedItems(prev => {
            const next = { ...prev, [index]: data };
            return next;
        });
    }, []);

    // When serialized items change, notify parent with the full array
    useEffect(() => {
        if (onSerializedUpdate && models && models.length > 0) {
            const keys = Object.keys(serializedItems);
            if (keys.length === models.length) {
                const arr = models.map((_, i) => serializedItems[i]).filter(Boolean);
                onSerializedUpdate(arr);
            }
        }
    }, [serializedItems, models, onSerializedUpdate]);

    // Reset serialized items when models array changes identity
    useEffect(() => {
        setSerializedItems({});
    }, [models]);

    if (!models || models.length === 0) {
        return <div className="debug-item no-data">No models in scene</div>;
    }

    return (
        <div className="debug-section-list">
            {models.map((model, index) => (
                <ModelItem
                    key={model.name || index}
                    model={model}
                    index={index}
                    onItemSerialized={handleItemSerialized}
                />
            ))}
        </div>
    );
}
