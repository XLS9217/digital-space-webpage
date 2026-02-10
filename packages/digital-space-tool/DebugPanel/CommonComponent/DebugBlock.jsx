import React, { useState } from 'react';
import { ChevronIcon } from '../CodeSvg';

const DebugBlock = ({ title, type, children, initialExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

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
                    <span className="debug-section-name">{title}</span>
                </div>
                {type && <span className="debug-section-type">{type}</span>}
            </div>
            
            {isExpanded && (
                <div className="debug-section-details">
                    {children}
                </div>
            )}
        </div>
    );
};

export default DebugBlock;
