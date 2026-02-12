import React, { useState, useRef } from 'react';

const BarHandle = ({ label, value, min = 0, max = 10, step = 0.1, editable = false, onValueChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const barRef = useRef(null);

    const percentage = ((localValue - min) / (max - min)) * 100;

    const handleMouseDown = (e) => {
        if (!editable || !onValueChange) return;
        setIsDragging(true);
        updateValue(e);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        updateValue(e);
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            if (onValueChange) {
                onValueChange(localValue);
            }
        }
    };

    const updateValue = (e) => {
        if (!barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percent = x / rect.width;
        const newValue = min + percent * (max - min);
        const steppedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(min, Math.min(max, steppedValue));
        setLocalValue(clampedValue);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, localValue]);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <div className="bar-handle-wrapper">
            <span className="bar-handle-label">{label}</span>
            <div
                ref={barRef}
                className="bar-handle-track-clean"
                onMouseDown={handleMouseDown}
                style={{ cursor: editable ? 'pointer' : 'default' }}
            >
                <div className="bar-handle-rail" />
                <div
                    className="bar-handle-circle"
                    style={{ left: `${percentage}%` }}
                />
            </div>
            <span className="bar-handle-value">{localValue.toFixed(2)}</span>
        </div>
    );
};

export default BarHandle;
