import React, { useState } from 'react';
import { CopyIcon } from '../CodeSvg';

const CoordDisplayer = ({ label, value, precision = 3 }) => {
    const [isHovered, setIsHovered] = useState(false);

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

    return (
        <div
            className="debug-detail-row"
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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