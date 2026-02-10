import React, { useEffect } from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';

const sanitizeVector = (vec) => {
    if (!vec) return { x: 0, y: 0, z: 0 };
    if (Array.isArray(vec)) return { x: vec[0], y: vec[1], z: vec[2] };
    return {
        x: vec.x || 0,
        y: vec.y || 0,
        z: vec.z || 0
    };
};

const ModelItem = ({ model, index }) => {
    return (
        <DebugBlock
            title={model.name || `Model ${index}`}
            type={model.type}
        >
            <CoordDisplayer
                label="Pos"
                value={model.position}
                objectName={model.name}
                property="position"
                editable={true}
            />
            <CoordDisplayer
                label="Rot"
                value={model.rotation}
                objectName={model.name}
                property="rotation"
                editable={true}
            />
            <CoordDisplayer
                label="Scale"
                value={model.scale}
                objectName={model.name}
                property="scale"
                editable={true}
            />
        </DebugBlock>
    );
};

export default function ModelList({ models, onSerializedUpdate }) {
    useEffect(() => {
        if (onSerializedUpdate) {
            const sanitizedModels = (models || []).map(model => ({
                name: model.name,
                type: model.type,
                file_location: model.file_location,
                position: sanitizeVector(model.position),
                rotation: sanitizeVector(model.rotation),
                scale: typeof model.scale === 'number'
                    ? { x: model.scale, y: model.scale, z: model.scale }
                    : sanitizeVector(model.scale)
            }));
            onSerializedUpdate(sanitizedModels);
        }
    }, [models, onSerializedUpdate]);

    if (!models || models.length === 0) {
        return <div className="debug-item no-data">No models in scene</div>;
    }

    return (
        <div className="debug-section-list">
            {models.map((model, index) => (
                <ModelItem 
                    key={index} 
                    model={model} 
                    index={index} 
                />
            ))}
        </div>
    );
}
