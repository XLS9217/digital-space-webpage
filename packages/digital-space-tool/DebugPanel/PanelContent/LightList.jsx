import { useState } from 'react';
import { ChevronIcon } from '../CodeSvg';

const LightItem = ({ light, index, formatValue }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="debug-section-item">
            <div 
                className="debug-section-header" 
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="debug-section-title">
                    <ChevronIcon 
                        size={14} 
                        isCollapsed={!isExpanded} 
                        style={{ marginRight: '4px' }}
                    />
                    <span className="debug-section-name">{light.name || `Light ${index}`}</span>
                </div>
                <span className="debug-section-type">{light.type}</span>
            </div>
            
            {isExpanded && (
                <div className="debug-section-details">
                    <div className="debug-detail-row">
                        <span className="debug-detail-label">Inten:</span>
                        <span className="debug-detail-values">
                            {formatValue(light.intensity)}
                        </span>
                    </div>
                    {light.position && (
                        <div className="debug-detail-row">
                            <span className="debug-detail-label">Pos:</span>
                            <span className="debug-detail-values">
                                {formatValue(light.position.x)}, {formatValue(light.position.y)}, {formatValue(light.position.z)}
                            </span>
                        </div>
                    )}
                    {light.color && (
                        <div className="debug-detail-row">
                            <span className="debug-detail-label">Color:</span>
                            <span className="debug-detail-values">
                                {light.color}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function LightList({ lights }) {
    if (!lights || lights.length === 0) {
        const defaultLights = [
            { name: 'Ambient', type: 'AmbientLight', intensity: 0.5 },
            { name: 'Directional', type: 'DirectionalLight', intensity: 1, position: { x: 10, y: 10, z: 5 } }
        ];
        
        return (
            <div className="debug-section-list">
                {defaultLights.map((light, index) => (
                    <LightItem 
                        key={index} 
                        light={light} 
                        index={index} 
                        formatValue={(val) => typeof val === 'number' ? val.toFixed(3) : val} 
                    />
                ))}
            </div>
        );
    }

    const formatValue = (val) => {
        if (val === undefined || val === null) return '0.000';
        if (typeof val === 'number') return val.toFixed(3);
        return val;
    };

    return (
        <div className="debug-section-list">
            {lights.map((light, index) => (
                <LightItem 
                    key={index} 
                    light={light} 
                    index={index} 
                    formatValue={formatValue} 
                />
            ))}
        </div>
    );
}
