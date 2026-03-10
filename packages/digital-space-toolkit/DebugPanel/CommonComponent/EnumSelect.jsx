import React from 'react';

export default function EnumSelect({ enumObj, onSelect }) {
    return (
        <div className="enum-select-tags">
            {Object.entries(enumObj).map(([key, value]) => (
                <span
                    key={key}
                    className="enum-select-tag"
                    onClick={() => onSelect(value)}
                >
                    {value}
                </span>
            ))}
        </div>
    );
}