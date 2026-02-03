import { MoveIcon } from '../CodeSvg';
import CollapseToggle from './CollapseToggle';
import useDragHandle from './DragHandle';
import './TopBar.css';

export default function TopBar({ panelWidth, panelHeight, setPanelPosition, setIsCollapsed, isCollapsed, sceneName }) {
    const { handleRef, handleMouseDown } = useDragHandle(panelWidth, panelHeight, setPanelPosition);
    console.log("sceneName", sceneName);
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
                Debug{sceneName && `:${sceneName}`}
            </div>
            <CollapseToggle
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
        </div>
    );
}