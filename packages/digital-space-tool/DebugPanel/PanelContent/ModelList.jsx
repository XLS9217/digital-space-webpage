import React from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';

const ModelItem = ({ model, index }) => {
    return (
        <DebugBlock 
            title={model.name || `Model ${index}`} 
            type={model.type}
        >
            <CoordDisplayer label="Pos" value={model.position} />
            <CoordDisplayer label="Rot" value={model.rotation} />
            <CoordDisplayer label="Scale" value={model.scale} />
        </DebugBlock>
    );
};

export default function ModelList({ models }) {
    if (!models || models.length === 0) {
        return <div className="debug-item">No models in scene</div>;
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
