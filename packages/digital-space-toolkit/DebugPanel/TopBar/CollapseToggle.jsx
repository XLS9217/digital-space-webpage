import { ChevronIcon } from '../CodeSvg';

export default function CollapseToggle({ isCollapsed, setIsCollapsed }) {
    return (
        <ChevronIcon 
            size={20}
            color="white"
            isCollapsed={isCollapsed}
            onClick={() => setIsCollapsed(prevIsCollapsed => !prevIsCollapsed)}
            style={{ cursor: 'pointer' }}
        />
    );
}