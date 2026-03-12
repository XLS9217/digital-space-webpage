import React, { useState, useRef } from 'react';

/**
 * TagList - flexible tag input like words in a text editor
 * Tags wrap naturally and can be added/removed
 *
 * @param {string[]} tags - current tags
 * @param {function} onChange - called with updated tags array
 * @param {string[]} recommendation - suggested values shown as clickable options
 * @param {string[]} limitation - if provided, only these values can be added
 */
export default function TagList({ tags = [], onChange, recommendation = [], limitation = [] }) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);

    // Filter out already-added tags from suggestions
    const availableRecommendations = recommendation.filter(r => !tags.includes(r));
    const filteredSuggestions = inputValue
        ? availableRecommendations.filter(r => r.toLowerCase().includes(inputValue.toLowerCase()))
        : availableRecommendations;

    const addTag = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (limitation.length > 0 && !limitation.includes(trimmed)) return;
        if (tags.includes(trimmed)) return;
        onChange([...tags, trimmed]);
        setInputValue('');
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            e.preventDefault();
            onChange(tags.slice(0, -1));
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
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
            <div className="tag-list-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="tag-list-input"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? 'Type and press Enter...' : ''}
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="tag-list-suggestions">
                        {filteredSuggestions.map((item, i) => (
                            <span
                                key={i}
                                className="tag-list-suggestion"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    addTag(item);
                                }}
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}