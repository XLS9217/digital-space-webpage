import React from 'react'//for webpack consistency,
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
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transformOrigin: 'center',
            cursor: 'pointer',
            ...style
        }}
        {...props}
    >
        <polyline points="6 9 12 15 18 9" />
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

export const PrinterIcon = ({ size = 20, color = "currentColor", ...props }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'pointer', ...props.style }}
            {...props}
        >
            {/* Top paper - This now "extends" or slides down into the printer */}
            <path
                d="M6 9V2h12v7"
                style={{
                    transition: 'transform 0.25s ease-out',
                    transform: isHovered ? 'translateY(2px)' : 'translateY(0)'
                }}
            />

            {/* Printer body */}
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />

            {/* Bottom output paper - Animation removed as requested */}
            <rect x="6" y="14" width="12" height="8" rx="1" ry="1" />
        </svg>
    );
};

export const DownloadIcon = ({ size = 20, color = "currentColor", ...props }) => (
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
        {/* Downward Arrow */}
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
        {/* Tray / Bottom Container */}
        <path d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
    </svg>
);

export const UploadIcon = ({ size = 20, color = "currentColor", ...props }) => (
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
        {/* Upward Arrow - Start at y=15 to create the gap from the tray */}
        <path d="M12 15V3m0 0l-4 4m4-4l4 4" />
        {/* Tray / Bottom Container */}
        <path d="M4 17v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
    </svg>
);

export const PlusCircleIcon = ({ size = 20, color = "currentColor", ...props }) => (
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
        {/* Outer Circle (O) */}
        <circle cx="12" cy="12" r="10" />
        {/* Plus Sign (+) */}
        <path d="M12 8v8m-4-4h8" />
    </svg>
);

export const TrashBinIcon = ({ size = 20, color = "currentColor", ...props }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'pointer', overflow: 'visible', ...props.style }} // Added overflow: visible as a safety
            {...props}
        >
            {/* The Lid - Shifted down to y=8 to provide headroom */}
            <path
                d="M3 8h18M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2"
                style={{
                    transition: 'transform 0.3s ease-out',
                    transform: isHovered ? 'rotate(-25deg) translateY(-2px)' : 'rotate(0deg)',
                    transformOrigin: '3px 8px'
                }}
            />

            {/* The Bin Body - Shifted down to start at y=8 */}
            <path d="M19 8v12a2 2 0 01-2 2H7a2 2 0 01-2-2V8" />

            {/* Internal Lines (||) - Adjusted to match new body position */}
            <line x1="10" y1="12" x2="10" y2="18" />
            <line x1="14" y1="12" x2="14" y2="18" />
        </svg>
    );
};




export const EyeIcon = ({ size = 20, color = "currentColor", isClosed = false, ...props }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    // lidPeak is the CONTROL POINT for the curve
    const lidPeak = isClosed ? 12 : (isHovered ? -4 : 2);

    // actualPeakY is the VISUAL TOP of the eyelid curve
    const actualPeakY = (12 + lidPeak) / 2;

    const bottomPeak = isClosed ? (isHovered ? 22 : 12) : (isHovered ? 28 : 22);

    // THE FIX: Move the y1 (root) slightly deeper (e.g., +1.5px) than the lid's edge
    const rootY = actualPeakY + 1.2;
    const sideRootY = actualPeakY + 2.2; // Side lashes sit lower on the curve

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={isHovered ? "2.5" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'pointer', overflow: 'visible', ...props.style }}
            {...props}
        >
            {/* Eyelashes: Roots adjusted to overlap the lid stroke */}
            <g style={{
                opacity: isClosed ? 0 : 1,
                transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                {/* Left Lash */}
                <line x1="7" y1={sideRootY} x2="6" y2={sideRootY - 4} />
                {/* Middle Lash */}
                <line x1="12" y1={rootY} x2="12" y2={rootY - 5} />
                {/* Right Lash */}
                <line x1="17" y1={sideRootY} x2="18" y2={sideRootY - 4} />
            </g>

            {/* Pupil: Centered, clipped for peek */}
            <circle
                cx="12"
                cy="12"
                r="3"
                fill={color}
                stroke="none"
                style={{
                    transition: 'opacity 0.25s ease, clip-path 0.25s ease',
                    opacity: isClosed ? (isHovered ? 1 : 0) : 1,
                    clipPath: (isClosed && isHovered)
                        ? 'inset(50% 0% 0% 0%)'
                        : 'inset(0% 0% 0% 0%)'
                }}
            />

            {/* The Eyelid Path */}
            <path
                d={`M2 12 Q12 ${lidPeak} 22 12 Q12 ${bottomPeak} 2 12`}
                style={{
                    transition: 'd 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), stroke-width 0.2s ease',
                }}
            />
        </svg>
    );
};



export const SnapshotIcon = ({ size = 20, color = "currentColor", ...props }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    // High-tech tilt effect
    const transform = isHovered
        ? 'translateY(-1px) rotate(-3deg) scale(1.05)'
        : 'translateY(0px) rotate(0deg) scale(1)';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={isHovered ? "2.5" : "2"}
            strokeLinecap="round"
            strokeLinejoin="round"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                cursor: 'pointer',
                overflow: 'visible',
                transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform,
                ...props.style
            }}
            {...props}
        >
            {/* Main Camera Body - Rounded Square */}
            <rect x="3" y="3" width="18" height="18" rx="5" />

            {/* Lens - Large Center Circle */}
            <circle cx="12" cy="12" r="5" />

            {/* Flash/Viewfinder - Small top-right circle */}
            <circle
                cx="17.5"
                cy="6.5"
                r="1.2"
                fill={isHovered ? color : "none"}
                stroke="none"
                style={{ transition: 'fill 0.2s ease' }}
            />

            {/* Internal Lens Detail - Aperture Dot */}
            <circle
                cx="12"
                cy="12"
                r="1.5"
                fill={isHovered ? color : "none"}
                stroke="none"
                style={{
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                    transformOrigin: '12px 12px'
                }}
            />
        </svg>
    );
};
