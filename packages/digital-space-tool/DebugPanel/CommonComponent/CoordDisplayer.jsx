import React, { useState } from 'react';
import { CopyIcon } from '../CodeSvg';
import { eventChannelHub, CONTROL_CHANNELS } from '../../EventChannelHub';

const CoordDisplayer = ({ label, value, precision = 3, objectName, property, editable = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({ x: 0, y: 0, z: 0 });

    const formatValue = (val) => {
        if (val === undefined || val === null) return (0).toFixed(precision);
        if (typeof val === 'number') return val.toFixed(precision);
        return val;
    };

    const renderValues = () => {
        if (typeof value === 'object' && value !== null) {
            return `${formatValue(value.x)}, ${formatValue(value.y)}, ${formatValue(value.z)}`;
        }
        return formatValue(value);
    };

    const handleCopy = (e) => {
        e.stopPropagation();

        let copyData;
        if (typeof value === 'object' && value !== null) {
            copyData = {
                x: parseFloat(formatValue(value.x)),
                y: parseFloat(formatValue(value.y)),
                z: parseFloat(formatValue(value.z))
            };
        } else {
            copyData = formatValue(value);
        }

        const jsonString = JSON.stringify(copyData);
        console.log(`Copied ${label}:`, jsonString);
        navigator.clipboard.writeText(jsonString)
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (editable && objectName && property) {
            setEditValues({
                x: value?.x ?? 0,
                y: value?.y ?? 0,
                z: value?.z ?? 0
            });
            setIsEditing(true);
        }
    };

    const handleInputChange = (axis, val) => {
        setEditValues(prev => ({
            ...prev,
            [axis]: parseFloat(val) || 0
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (objectName && property) {
            eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
                name: objectName,
                property: property,
                value: editValues
            });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="debug-detail-row" style={{ flexDirection: 'column', gap: '4px' }}>
                <span className="debug-detail-label">{label}:</span>
                <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                    <input
                        type="number"
                        step="0.01"
                        value={editValues.x}
                        onChange={(e) => handleInputChange('x', e.target.value)}
                        className="coord-input"
                        placeholder="X"
                        autoFocus
                    />
                    <input
                        type="number"
                        step="0.01"
                        value={editValues.y}
                        onChange={(e) => handleInputChange('y', e.target.value)}
                        className="coord-input"
                        placeholder="Y"
                    />
                    <input
                        type="number"
                        step="0.01"
                        value={editValues.z}
                        onChange={(e) => handleInputChange('z', e.target.value)}
                        className="coord-input"
                        placeholder="Z"
                    />
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                    <button type="submit" className="coord-button coord-button-submit">✓</button>
                    <button type="button" onClick={handleCancel} className="coord-button coord-button-cancel">✕</button>
                </div>
            </form>
        );
    }

    return (
        <div
            className="debug-detail-row"
            style={{ position: 'relative', cursor: editable ? 'pointer' : 'default' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleEdit}
        >
            <span className="debug-detail-label">{label}:</span>
            <span className="debug-detail-values">
                {renderValues()}
            </span>
            {isHovered && (
                <CopyIcon
                    size={12}
                    className="copy-icon"
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                    onClick={handleCopy}
                    title={`Copy ${label}`}
                />
            )}
        </div>
    );
};

export default CoordDisplayer;