import React, { useState, useRef } from 'react';
import { eventChannelHub, CONTROL_CHANNELS } from '../../EventChannelHub';

const BarHandle = ({ label, value, min = 0, max = 10, step = 0.1, objectName, property, editable = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const barRef = useRef(null);

    const percentage = ((localValue - min) / (max - min)) * 100;

    const handleMouseDown = (e) => {
        if (!editable || !objectName || !property) return;
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
            // Publish the final value
            if (objectName && property) {
                eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE_BY_NAME, {
                    name: objectName,
                    property: property,
                    value: localValue
                });
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

    // Update local value when prop changes
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <div
            className="debug-detail-row"
            style={{ flexDirection: 'column', gap: '4px', paddingRight: '8px' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="debug-detail-label">{label}:</span>
                <span className="debug-detail-values" style={{ minWidth: '40px', textAlign: 'right' }}>
                    {localValue.toFixed(2)}
                </span>
            </div>
            <div
                ref={barRef}
                className={`bar-handle-track ${editable ? 'bar-handle-editable' : ''}`}
                onMouseDown={handleMouseDown}
                style={{
                    cursor: editable ? 'pointer' : 'default',
                    opacity: isDragging ? 1 : (isHovered ? 0.9 : 0.7)
                }}
            >
                <div
                    className="bar-handle-fill"
                    style={{ width: `${percentage}%` }}
                />
                <div
                    className="bar-handle-thumb"
                    style={{ left: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default BarHandle;
