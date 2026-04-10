import React from 'react'//for webpack consistency,
import { MoveIcon, CodeBracketsIcon } from '../CodeSvg';
import CollapseToggle from './CollapseToggle';
import useDragHandle from './DragHandle';
import { version } from '../../package.json';
import './TopBar.css';

export default function TopBar({ panelWidth, panelHeight, setPanelPosition, setIsCollapsed, isCollapsed, sceneName, showJson, setShowJson }) {
    const { handleRef, handleMouseDown } = useDragHandle(panelWidth, panelHeight, setPanelPosition);

    return (
        <div className="drag-handle">
            <MoveIcon
                size={16}
                color="white"
                ref={handleRef}
                onMouseDown={handleMouseDown}
                style={{ cursor: 'grab' }}
            />
            <div className="topbar-title">
                [v{version}]{sceneName && `${sceneName}`}
            </div>
            <button
                className="json-toggle-button"
                onClick={() => setShowJson(!showJson)}
                title={showJson ? "Show camera view" : "Show scene JSON"}
            >
                &lt;/&gt;
            </button>
            <CollapseToggle
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
        </div>
    );
}