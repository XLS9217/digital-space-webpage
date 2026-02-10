import React, { useState, useRef, useEffect } from 'react';
import { CopyIcon } from '../CodeSvg';

const CoordDisplayer = ({ label, value, precision = 3, editable = false, onValueChange }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [editValues, setEditValues] = useState({ x: '', y: '', z: '' });
    const [focusedAxis, setFocusedAxis] = useState(null);

    const formatValue = (val) => {
        if (val === undefined || val === null) return (0).toFixed(precision);
        if (typeof val === 'number') return val.toFixed(precision);
        return val;
    };

    const getDisplayValue = (axis) => {
        if (focusedAxis === axis) return editValues[axis];
        if (typeof value === 'object' && value !== null) return formatValue(value[axis]);
        return formatValue(value);
    };

    const handleFocus = (axis) => {
        if (!editable) return;
        setFocusedAxis(axis);
        setEditValues({
            x: value?.x ?? 0,
            y: value?.y ?? 0,
            z: value?.z ?? 0,
        });
    };

    const handleBlur = () => {
        setFocusedAxis(null);
    };

    const handleInputChange = (axis, val) => {
        setEditValues(prev => ({ ...prev, [axis]: val }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onValueChange) {
                onValueChange({
                    x: parseFloat(editValues.x) || 0,
                    y: parseFloat(editValues.y) || 0,
                    z: parseFloat(editValues.z) || 0,
                });
            }
            e.target.blur();
        } else if (e.key === 'Escape') {
            e.target.blur();
        }
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
        navigator.clipboard.writeText(JSON.stringify(copyData));
    };

    const axes = ['x', 'y', 'z'];

    return (
        <div
            className="coord-row"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className="coord-label">{label}</span>
            <div className="coord-boxes">
                {axes.map((axis) => (
                    <input
                        key={axis}
                        className={`coord-box ${editable ? 'coord-box-editable' : 'coord-box-readonly'}`}
                        type="text"
                        value={getDisplayValue(axis)}
                        readOnly={!editable}
                        tabIndex={editable ? 0 : -1}
                        onFocus={() => handleFocus(axis)}
                        onBlur={handleBlur}
                        onChange={(e) => handleInputChange(axis, e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                ))}
            </div>
            <div className="coord-copy-icon-slot">
                {isHovered && (
                    <CopyIcon
                        size={10}
                        className="coord-copy-icon"
                        onClick={handleCopy}
                        title={`Copy ${label}`}
                    />
                )}
            </div>
        </div>
    );
};

export default CoordDisplayer;
