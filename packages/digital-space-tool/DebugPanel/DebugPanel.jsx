import { useEffect, useState, useRef } from "react";
import { eventChannelHub, DEBUG_CHANNELS } from "../EventChannelHub";
import TopBar from "./TopBar/TopBar";
import PanelContent from "./PanelContent/PanelContent";
import { ResizeSlashIcon } from "./CodeSvg";
import './DebugPanel.css';

export default function DebugPanel() {
    const [position, setPosition] = useState({ x: window.innerWidth - 315, y: 15 }); // Start at top-right, accounting for panel width and margin
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [sceneData, setSceneData] = useState(null);
    const [size, setSize] = useState({ width: 300, height: 400 });
    const isResizing = useRef(false);

    // Fixed dimensions for the panel - commented as requested
    const PANEL_WIDTH = size.width;
    const PANEL_HEIGHT = size.height;

    useEffect(() => {
        const handleSceneData = (data) => {
            console.log("Scene data:", data);
            setSceneData(data);
        };

        eventChannelHub.subscribe(DEBUG_CHANNELS.INTERNAL_DEBUG_SCENE, handleSceneData);
        return () => {
            eventChannelHub.unsubscribe(DEBUG_CHANNELS.INTERNAL_DEBUG_SCENE, handleSceneData);
        };
    }, []);

    // Resize functionality
    const handleResizeMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;
        document.body.style.cursor = 'nwse-resize';
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing.current) return;

            const newWidth = e.clientX - position.x;
            const newHeight = e.clientY - position.y;

            // Set minimum dimensions
            if (newWidth >= 200 && newHeight >= 100) {
                setSize({
                    width: newWidth,
                    height: newHeight
                });
            }
        };

        const handleMouseUp = () => {
            if (isResizing.current) {
                isResizing.current = false;
                document.body.style.cursor = 'default';
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [position]);

    return (
        <div
            className="debug-panel-overlay"
            style={{
                width: `${PANEL_WIDTH}px`,
                height: isCollapsed ? '30px' : `${PANEL_HEIGHT}px`, // Adjust height when collapsed
                left: `${position.x}px`,
                top: `${position.y}px`,
                position: 'fixed' // Changed to fixed to support dragging
            }}
        >
            <TopBar
                panelWidth={PANEL_WIDTH}
                panelHeight={PANEL_HEIGHT}
                setPanelPosition={setPosition}
                setIsCollapsed={setIsCollapsed}
                isCollapsed={isCollapsed}
                sceneName={sceneData?.scene || "[scene]"}
            />
            {!isCollapsed && <PanelContent sceneData={sceneData} />}
            {!isCollapsed && (
                <div
                    className="resize-handle"
                    onMouseDown={handleResizeMouseDown}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '20px',
                        height: '20px',
                        cursor: 'nwse-resize',
                        zIndex: 10
                    }}
                >
                    <ResizeSlashIcon
                        size={20}
                        color="white"
                        style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            opacity: 0.5
                        }}
                    />
                </div>
            )}
        </div>
    );
}