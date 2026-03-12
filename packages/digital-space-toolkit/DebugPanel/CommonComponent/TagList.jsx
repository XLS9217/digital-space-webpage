import React, { useState, useRef } from 'react';

/**
 * TagList - flexible tag input like words in a text editor
 * Tags wrap naturally and can be added/removed
 */
export default function TagList({ tags = [], onChange }) {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newTag = inputValue.trim();
            onChange([...tags, newTag]);
            setInputValue('');
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            // Remove last tag when backspace on empty input
            e.preventDefault();
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (index) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="tag-list-container" onClick={() => inputRef.current?.focus()}>
            {tags.map((tag, index) => (
                <span key={index} className="tag-list-tag">
                    {tag}
                    <span
                        className="tag-list-remove"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeTag(index);
                        }}
                    >
                        &times;
                    </span>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                className="tag-list-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? 'Type and press Enter...' : ''}
            />
        </div>
    );
}