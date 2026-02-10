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

const LightItem = ({ light, index }) => {
    return (
        <DebugBlock 
            title={light.name || `Light ${index}`} 
            type={light.type}
        >
            <CoordDisplayer label="Inten" value={light.intensity} />
            {light.position && <CoordDisplayer label="Pos" value={light.position} />}
            {light.color && (
                <div className="debug-detail-row">
                    <span className="debug-detail-label">Color:</span>
                    <span className="debug-detail-values">
                        {light.color}
                    </span>
                </div>
            )}
        </DebugBlock>
    );
};

export default function LightList({ lights, onSerializedUpdate }) {
    useEffect(() => {
        if (onSerializedUpdate) {
            const sanitizedLights = (lights || []).map(light => ({
                ...light,
                position: light.position ? sanitizeVector(light.position) : undefined
            }));
            onSerializedUpdate(sanitizedLights);
        }
    }, [lights, onSerializedUpdate]);

    if (!lights || lights.length === 0) {
        return <div className="debug-item no-data">No lights in scene</div>;
    }

    return (
        <div className="debug-section-list">
            {lights.map((light, index) => (
                <LightItem 
                    key={index} 
                    light={light} 
                    index={index} 
                />
            ))}
        </div>
    );
}
