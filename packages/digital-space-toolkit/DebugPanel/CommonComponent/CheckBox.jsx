import React from 'react';
import './CommonComponent.css';

export default function CheckBox({ label, checked = false, onChange, disabled = false }) {
    return (
        <div className="debug-checkbox-container">
            <label className="debug-checkbox-label">
                <span className="debug-checkbox-text">{label}</span>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange && onChange(e.target.checked)}
                    disabled={disabled}
                    className="debug-checkbox-input"
                />
            </label>
        </div>
    );
}