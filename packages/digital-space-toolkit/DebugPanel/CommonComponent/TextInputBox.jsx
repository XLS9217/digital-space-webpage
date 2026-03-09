import React, { useState } from 'react';
import { CopyIcon } from '../CodeSvg';

const TextInputBox = ({ label, value = '', editable = false, onValueChange }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        if (!editable) return;
        setIsFocused(true);
        setEditValue(value);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onValueChange) {
                onValueChange(editValue);
            }
            e.target.blur();
        } else if (e.key === 'Escape') {
            e.target.blur();
        }
    };

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
    };

    return (
        <div
            className="coord-row"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className="coord-label">{label}</span>
            <div className="coord-boxes">
                <input
                    className={`coord-box ${editable ? 'coord-box-editable' : 'coord-box-readonly'}`}
                    type="text"
                    value={isFocused ? editValue : value}
                    readOnly={!editable}
                    tabIndex={editable ? 0 : -1}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
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

export default TextInputBox;