/**
 * A color picker that will serialize the color as a hex string
 */
import React, { useState, useRef, useEffect } from 'react';

const ColorPicker = ({ label, value, editable = false, onValueChange }) => {
    const [localValue, setLocalValue] = useState(value || '#ffffff');
    const inputRef = useRef(null);

    // Sync from props when value changes externally
    useEffect(() => {
        if (value) {
            setLocalValue(value);
        }
    }, [value]);

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setLocalValue(newColor);
        if (editable && onValueChange) {
            onValueChange(newColor);
        }
    };

    const handleInputClick = () => {
        if (editable && inputRef.current) {
            inputRef.current.click();
        }
    };

    return (
        <div className="color-picker-wrapper">
            <span className="color-picker-label">{label}</span>
            <div className="color-picker-display-wrapper">
                <div
                    className={`color-picker-display ${editable ? 'color-picker-display-editable' : ''}`}
                    style={{ backgroundColor: localValue }}
                    onClick={handleInputClick}
                    title={editable ? 'Click to change color' : localValue}
                />
                <span className="color-picker-value">{localValue}</span>
            </div>
            {editable && (
                <input
                    ref={inputRef}
                    type="color"
                    value={localValue}
                    onChange={handleColorChange}
                    className="color-picker-input"
                />
            )}
        </div>
    );
};

export default ColorPicker;