import { useState } from 'react';
import { ChevronIcon } from '../CodeSvg';

const ModelItem = ({ model, index, formatValue }) => {
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
                    <span className="debug-section-name">{model.name || `Model ${index}`}</span>
                </div>
                <span className="debug-section-type">{model.type}</span>
            </div>
            
            {isExpanded && (
                <div className="debug-section-details">
                    <div className="debug-detail-row">
                        <span className="debug-detail-label">Pos:</span>
                        <span className="debug-detail-values">
                            {formatValue(model.position?.x)}, {formatValue(model.position?.y)}, {formatValue(model.position?.z)}
                        </span>
                    </div>
                    <div className="debug-detail-row">
                        <span className="debug-detail-label">Rot:</span>
                        <span className="debug-detail-values">
                            {formatValue(model.rotation?.x)}, {formatValue(model.rotation?.y)}, {formatValue(model.rotation?.z)}
                        </span>
                    </div>
                    <div className="debug-detail-row">
                        <span className="debug-detail-label">Scale:</span>
                        <span className="debug-detail-values">
                            {typeof model.scale === 'object' 
                                ? `${formatValue(model.scale.x)}, ${formatValue(model.scale.y)}, ${formatValue(model.scale.z)}`
                                : formatValue(model.scale)
                            }
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ModelList({ models }) {
    if (!models || models.length === 0) {
        return <div className="debug-item">No models in scene</div>;
    }

    const formatValue = (val) => {
        if (val === undefined || val === null) return '0.000';
        return parseFloat(val).toFixed(3);
    };

    return (
        <div className="debug-section-list">
            {models.map((model, index) => (
                <ModelItem 
                    key={index} 
                    model={model} 
                    index={index} 
                    formatValue={formatValue} 
                />
            ))}
        </div>
    );
}
