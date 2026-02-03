import { useEffect, useState } from "react";
import { eventChannelHub, DEBUG_CHANNELS } from "../EventChannelHub";
import TopBar from "./TopBar/TopBar";
import PanelContent from "./PanelContent/PanelContent";
import './DebugPanel.css';

export default function DebugPanel() {
    const [position, setPosition] = useState({ x: window.innerWidth - 315, y: 15 }); // Start at top-right, accounting for panel width and margin
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [sceneData, setSceneData] = useState(null);

    // Fixed dimensions for the panel - commented as requested
    const PANEL_WIDTH = 300;
    const PANEL_HEIGHT = 400;

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
        </div>
    );
}