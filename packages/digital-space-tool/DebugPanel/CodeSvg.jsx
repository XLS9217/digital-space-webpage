
export const MoveIcon = ({ size = 20, color = "currentColor", ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ cursor: 'grab' }} // Hinting that this is a drag handle
        {...props}
    >
        {/* Vertical Arrow */}
        <path d="M12 2v20M9 5l3-3 3 3M9 19l3 3 3-3" />
        {/* Horizontal Arrow */}
        <path d="M2 12h20M5 9l-3 3 3 3M19 9l3 3-3 3" />
    </svg>
);


export const ChevronIcon = ({ size = 20, color = "currentColor", isCollapsed = false, style, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
            transition: 'transform 0.2s ease-in-out',
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transformOrigin: 'center',
            cursor: 'pointer',
            ...style
        }}
        {...props}
    >
        <polyline points="18 15 12 9 6 15" />
    </svg>
);

export const CopyIcon = ({ size = 20, color = "currentColor", ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Back Square */}
        <path d="M9 9V6a2 2 0 012-2h7a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
        {/* Front Square */}
        <rect x="4" y="9" width="11" height="11" rx="2" ry="2" />
    </svg>
);

export const ResizeSlashIcon = ({ size = 20, color = "currentColor", ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M 20 14 L 20 20 L 14 20 M 20 8 L 20 14 L 14 14 L 8 20 L 14 20 M 20 2 L 20 8 L 14 8 L 8 14 L 2 20 L 8 20 L 14 14 L 20 8"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
        />
    </svg>
);

export const CodeBracketsIcon = ({ size = 20, color = "currentColor", ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {/* Left bracket < */}
        <polyline points="16 18 22 12 16 6" />
        {/* Right bracket > */}
        <polyline points="8 6 2 12 8 18" />
    </svg>
);