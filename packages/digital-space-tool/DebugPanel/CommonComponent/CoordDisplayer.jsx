import React from 'react';

const CoordDisplayer = ({ label, value, precision = 3 }) => {
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

    return (
        <div className="debug-detail-row">
            <span className="debug-detail-label">{label}:</span>
            <span className="debug-detail-values">
                {renderValues()}
            </span>
        </div>
    );
};

export default CoordDisplayer;