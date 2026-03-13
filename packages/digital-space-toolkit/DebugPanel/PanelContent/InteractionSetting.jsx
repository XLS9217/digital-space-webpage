import React from 'react';
import { useState } from 'react';
import { ChevronIcon } from '../CodeSvg';
import CameraControlBlock from './CameraControlBlock';

export default function InteractionSetting({ onSerializedUpdate, initialControl }) {
    const [interactionExpanded, setInteractionExpanded] = useState(true);

    return (
        <>
            <div className="debug-list-title">
                <div className="debug-list-title-left" onClick={() => setInteractionExpanded(!interactionExpanded)}>
                    <ChevronIcon size={14} isCollapsed={!interactionExpanded} style={{ marginRight: '4px' }} />
                    <h3>Interaction Setting</h3>
                </div>
            </div>
            <div style={{ display: interactionExpanded ? 'block' : 'none' }}>
                <CameraControlBlock
                    onSerializedUpdate={onSerializedUpdate}
                    initialControl={initialControl}
                />
            </div>
        </>
    );
}