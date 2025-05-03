import React, { useRef, useState } from 'react';
import { CanvasItem as CanvasItemType, Point } from '@/lib/flowCreator';
import { getIconById } from '@/lib/iconData';

interface CanvasItemProps {
  item: CanvasItemType;
  position: Point;
  selected: boolean;
  connectMode: boolean;
  onSelect: () => void;
  onMove: (position: Point) => void;
  onDelete: () => void;
}

const CanvasItem: React.FC<CanvasItemProps> = ({
  item,
  position,
  selected,
  connectMode,
  onSelect,
  onMove,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const icon = getIconById(item.icon.id);
  if (!icon) return null;
  
  const IconComponent = icon.icon;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    onSelect();
    
    if (!connectMode) {
      setIsDragging(true);
      
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      
      onMove(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Set up and clean up global event listeners for drag
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      id={`canvas-item-${item.id}`}
      ref={elementRef}
      className={`absolute ${selected ? 'ring-2 ring-primary' : ''} ${connectMode ? 'ring-2 ring-blue-600' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: selected || isDragging ? 10 : 1,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-24 h-24 flex flex-col items-center justify-center bg-white rounded-lg shadow-md border border-gray-200 p-2">
        <div className={`text-3xl ${icon.color}`}>
          <IconComponent size={32} />
        </div>
        <span className="text-xs text-center mt-1 text-gray-600 truncate max-w-full">
          {icon.name}
        </span>
      </div>
    </div>
  );
};

export default CanvasItem;
