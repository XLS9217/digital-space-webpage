import React, { useState, useRef, useEffect } from 'react';
import { ChevronIcon, TrashBinIcon, EyeIcon, PrinterIcon } from '../CodeSvg';

const EditableName = ({ title, onTitleChange, initialEditing = false }) => {
    const [isEditing, setIsEditing] = useState(initialEditing);
    const [editValue, setEditValue] = useState(title);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const commit = () => {
        setIsEditing(false);
        const trimmed = editValue.trim();
        if (trimmed && trimmed !== title) {
            onTitleChange(trimmed);
        } else {
            setEditValue(title);
        }
    };

    if (!isEditing) {
        return (
            <span
                className={`debug-section-name ${onTitleChange ? 'debug-section-name-editable' : ''}`}
                onClick={(e) => {
                    if (onTitleChange) {
                        e.stopPropagation();
                        setEditValue(title);
                        setIsEditing(true);
                    }
                }}
            >
                {title}
            </span>
        );
    }

    return (
        <input
            ref={inputRef}
            className="debug-section-name-input"
            type="text"
            value={editValue}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') {
                    setEditValue(title);
                    setIsEditing(false);
                }
            }}
        />
    );
};

const DebugBlock = ({ title, type, children, initialExpanded = false, alwaysExpanded = false, initialEditing = false, onTitleChange, onDelete, onVisibilityToggle, visible, onPrint }) => {
    const [isExpanded, setIsExpanded] = useState(initialExpanded || alwaysExpanded);
    const expanded = alwaysExpanded || isExpanded;

    return (
        <div className="debug-section-item">
            <div className="debug-section-header">
                <div className="debug-section-title">
                    {!alwaysExpanded && (
                        <ChevronIcon
                            size={14}
                            isCollapsed={!isExpanded}
                            style={{ marginRight: '4px', cursor: 'pointer' }}
                            onClick={() => setIsExpanded(!isExpanded)}
                        />
                    )}
                    <EditableName title={title} onTitleChange={onTitleChange} initialEditing={initialEditing} />
                </div>
                <div className="debug-section-header-right">
                    {type && <span className="debug-section-type">{type}</span>}
                    {onPrint && (
                        <PrinterIcon size={14} onClick={onPrint} title="Print to console" />
                    )}
                    {onVisibilityToggle && (
                        <EyeIcon size={14} isClosed={!visible} onClick={onVisibilityToggle} title={visible ? "Hide" : "Show"} />
                    )}
                    {onDelete && (
                        <TrashBinIcon size={14} onClick={onDelete} title="Delete" />
                    )}
                </div>
            </div>

            {expanded && (
                <div className="debug-section-details">
                    {children}
                </div>
            )}
        </div>
    );
};

export default DebugBlock;