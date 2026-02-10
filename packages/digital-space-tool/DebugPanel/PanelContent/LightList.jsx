import React from 'react';
import DebugBlock from '../CommonComponent/DebugBlock';
import CoordDisplayer from '../CommonComponent/CoordDisplayer';

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

export default function LightList({ lights }) {
    const displayLights = (!lights || lights.length === 0) ? [
        { name: 'Ambient', type: 'AmbientLight', intensity: 0.5 },
        { name: 'Directional', type: 'DirectionalLight', intensity: 1, position: { x: 10, y: 10, z: 5 } }
    ] : lights;

    return (
        <div className="debug-section-list">
            {displayLights.map((light, index) => (
                <LightItem 
                    key={index} 
                    light={light} 
                    index={index} 
                />
            ))}
        </div>
    );
}
