import React from 'react';
import { useState, useCallback } from 'react';
import { ChevronIcon } from '../../CodeSvg.jsx';
import BackgroundSetting from './BackgroundSetting.jsx';

export default function GeneralSetting({ onSerializedUpdate, initialGeneral }) {
    const [generalExpanded, setGeneralExpanded] = useState(true);

    const handleBackgroundUpdate = useCallback((backgroundColor) => {
        if (onSerializedUpdate) {
            onSerializedUpdate({
                background: backgroundColor
            });
        }
    }, [onSerializedUpdate]);

    return (
        <>
            <div className="debug-list-title">
                <div className="debug-list-title-left" onClick={() => setGeneralExpanded(!generalExpanded)}>
                    <ChevronIcon size={14} isCollapsed={!generalExpanded} style={{ marginRight: '4px' }} />
                    <h3>General Setting</h3>
                </div>
            </div>
            <div style={{ display: generalExpanded ? 'block' : 'none' }}>
                <div className="debug-section-list">
                    <BackgroundSetting
                        onSerializedUpdate={handleBackgroundUpdate}
                        initialBackground={initialGeneral?.background}
                    />
                </div>
            </div>
        </>
    );
}