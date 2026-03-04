import React, { useState, useRef } from 'react';

const MinMaxHandle = ({
    label,
    minValue,
    maxValue,
    rangeMin = 0,
    rangeMax = 10,
    step = 0.1,
    editable = false,
    onValueChange
}) => {
    const [isDragging, setIsDragging] = useState(null); // 'min' or 'max' or null
    const [localMin, setLocalMin] = useState(minValue);
    const [localMax, setLocalMax] = useState(maxValue);
    const barRef = useRef(null);

    const minPercentage = ((localMin - rangeMin) / (rangeMax - rangeMin)) * 100;
    const maxPercentage = ((localMax - rangeMin) / (rangeMax - rangeMin)) * 100;

    const handleMouseDown = (handle) => (e) => {
        if (!editable || !onValueChange) return;
        e.stopPropagation();
        setIsDragging(handle);
        updateValue(handle, e);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        updateValue(isDragging, e);
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(null);
            if (onValueChange) {
                onValueChange({ min: localMin, max: localMax });
            }
        }
    };

    const updateValue = (handle, e) => {
        if (!barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percent = x / rect.width;
        const newValue = rangeMin + percent * (rangeMax - rangeMin);
        const steppedValue = Math.round(newValue / step) * step;
        const clampedValue = Math.max(rangeMin, Math.min(rangeMax, steppedValue));
        const normalizedValue = Number(clampedValue.toFixed(3));

        if (handle === 'min') {
            // Min can't exceed max
            setLocalMin(Math.min(normalizedValue, localMax));
        } else {
            // Max can't go below min
            setLocalMax(Math.max(normalizedValue, localMin));
        }
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
    }, [isDragging, localMin, localMax]);

    React.useEffect(() => {
        setLocalMin(minValue);
    }, [minValue]);

    React.useEffect(() => {
        setLocalMax(maxValue);
    }, [maxValue]);

    return (
        <div className="bar-handle-wrapper">
            <span className="bar-handle-label">{label}</span>
            <div
                ref={barRef}
                className="bar-handle-track-clean"
                style={{ cursor: editable ? 'pointer' : 'default' }}
            >
                <div className="bar-handle-rail" />
                <div
                    className="minmax-handle-highlight"
                    style={{
                        left: `${Math.min(minPercentage, maxPercentage)}%`,
                        width: `${Math.abs(maxPercentage - minPercentage)}%`
                    }}
                />
                <div
                    className="bar-handle-circle"
                    style={{ left: `${minPercentage}%` }}
                    onMouseDown={handleMouseDown('min')}
                />
                <div
                    className="bar-handle-circle"
                    style={{ left: `${maxPercentage}%` }}
                    onMouseDown={handleMouseDown('max')}
                />
            </div>
            <span className="bar-handle-value">
                {localMin.toFixed(2)} - {localMax.toFixed(2)}
            </span>
        </div>
    );
};

export default MinMaxHandle;