import { useRef, useEffect } from "react";

// Hook that provides drag functionality
export default function useDragHandle(panelWidth, panelHeight, setPanelPosition) {
    const handleRef = useRef(null);
    const isDragging = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    
    const handleMouseDown = (e) => {
        isDragging.current = true;
        
        // Calculate the offset between mouse and panel position when drag starts
        const rect = handleRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        
        // Calculate new position based on initial offset
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        
        setPanelPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [panelWidth, panelHeight]);

    return { handleRef, handleMouseDown };
}