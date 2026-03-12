import React from 'react';

export default function DebugButton({ label, onClick, title }) {
    return (
        <span
            className="debug-button"
            onClick={onClick}
            title={title}
        >
            {label}
        </span>
    );
}