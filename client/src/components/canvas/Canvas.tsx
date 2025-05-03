import React, { useState, useRef, useEffect } from 'react';
import { 
  FlowState, 
  CanvasItem as CanvasItemType, 
  Connection as ConnectionType,
  Point,
  calculateConnectionPath
} from '@/lib/flowCreator';
import CanvasItem from './CanvasItem';
import Connection from './Connection';
import { IconType } from '@/lib/iconData';
import { generateUniqueId } from '@/lib/utils';

interface CanvasProps {
  flowState: FlowState;
  onUpdateFlowState: (newState: FlowState) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  flowState, 
  onUpdateFlowState,
  onDragOver,
  onDrop 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [tempConnection, setTempConnection] = useState<{ source: Point, target: Point } | null>(null);
  
  // Handle canvas pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if not clicking on an item and right mouse button or middle mouse button
    if (e.button === 1 || e.button === 2) {
      setIsDragging(true);
      setDragStartPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const dx = e.clientX - dragStartPoint.x;
      const dy = e.clientY - dragStartPoint.y;
      
      onUpdateFlowState({
        ...flowState,
        offset: {
          x: flowState.offset.x + dx,
          y: flowState.offset.y + dy
        }
      });
      
      setDragStartPoint({ x: e.clientX, y: e.clientY });
    }
    
    // Handle temporary connection line in connect mode
    if (flowState.connectMode && flowState.sourceItemId) {
      const sourceItem = flowState.items.find(item => item.id === flowState.sourceItemId);
      if (sourceItem) {
        const sourceRect = document.getElementById(`canvas-item-${sourceItem.id}`)?.getBoundingClientRect();
        if (sourceRect) {
          const source = {
            x: sourceRect.left + sourceRect.width / 2,
            y: sourceRect.top + sourceRect.height / 2
          };
          
          const target = {
            x: e.clientX,
            y: e.clientY
          };
          
          setTempConnection({ source, target });
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTempConnection(null);
  };

  // Handle canvas wheel for zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Calculate new scale factor
    let newScale = flowState.scale;
    if (e.deltaY < 0) {
      // Zoom in
      newScale = Math.min(flowState.scale * 1.1, 3);
    } else {
      // Zoom out
      newScale = Math.max(flowState.scale / 1.1, 0.3);
    }
    
    onUpdateFlowState({
      ...flowState,
      scale: newScale
    });
  };

  // Handle canvas item selection
  const handleSelectItem = (id: string) => {
    if (flowState.connectMode) {
      // If in connect mode and sourceItemId is set, create connection
      if (flowState.sourceItemId && flowState.sourceItemId !== id) {
        const newConnection: ConnectionType = {
          id: generateUniqueId(),
          sourceId: flowState.sourceItemId,
          targetId: id,
          animating: false
        };
        
        onUpdateFlowState({
          ...flowState,
          connections: [...flowState.connections, newConnection],
          sourceItemId: null
        });
      } else {
        // Set as source for connection
        onUpdateFlowState({
          ...flowState,
          sourceItemId: id
        });
      }
    } else {
      // Regular selection
      onUpdateFlowState({
        ...flowState,
        selectedItemId: id
      });
    }
  };

  // Handle canvas item movement
  const handleMoveItem = (id: string, newPosition: Point) => {
    const updatedItems = flowState.items.map(item => 
      item.id === id ? { ...item, position: newPosition } : item
    );
    
    onUpdateFlowState({
      ...flowState,
      items: updatedItems
    });
  };

  // Handle item deletion (e.g., with Delete key)
  const handleDeleteItem = (id: string) => {
    const updatedItems = flowState.items.filter(item => item.id !== id);
    const updatedConnections = flowState.connections.filter(
      conn => conn.sourceId !== id && conn.targetId !== id
    );
    
    onUpdateFlowState({
      ...flowState,
      items: updatedItems,
      connections: updatedConnections,
      selectedItemId: null
    });
  };

  // Handle key events for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key to remove selected item
      if (e.key === 'Delete' && flowState.selectedItemId) {
        handleDeleteItem(flowState.selectedItemId);
      }
      
      // Escape key to exit connect mode
      if (e.key === 'Escape') {
        onUpdateFlowState({
          ...flowState,
          connectMode: false,
          sourceItemId: null
        });
        setTempConnection(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flowState]);

  // Prevent context menu in canvas
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = (point: Point): Point => {
    return {
      x: point.x * flowState.scale + flowState.offset.x,
      y: point.y * flowState.scale + flowState.offset.y
    };
  };

  // Get canvas items with adjusted positions based on scale/offset
  const getAdjustedItems = () => {
    return flowState.items.map(item => ({
      ...item,
      screenPosition: canvasToScreen(item.position)
    }));
  };

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full relative overflow-hidden bg-gray-50 cursor-grab"
      style={{
        backgroundSize: `${20 * flowState.scale}px ${20 * flowState.scale}px`,
        backgroundImage: `
          linear-gradient(to right, rgba(209, 213, 219, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(209, 213, 219, 0.1) 1px, transparent 1px)
        `,
        backgroundPosition: `${flowState.offset.x}px ${flowState.offset.y}px`
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Main canvas content div that scales and translates */}
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{ 
          transform: `scale(${flowState.scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* SVG layer for connections */}
        <svg 
          width="100%" 
          height="100%" 
          className="absolute top-0 left-0 pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker 
              id="arrowhead" 
              markerWidth="10" 
              markerHeight="7" 
              refX="9" 
              refY="3.5" 
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#4F46E5" />
            </marker>
          </defs>
          
          {/* Render all connections */}
          {flowState.connections.map(connection => {
            const sourceItem = flowState.items.find(item => item.id === connection.sourceId);
            const targetItem = flowState.items.find(item => item.id === connection.targetId);
            
            if (!sourceItem || !targetItem) return null;
            
            const sourcePos = {
              x: sourceItem.position.x + 50 + flowState.offset.x / flowState.scale,
              y: sourceItem.position.y + 50 + flowState.offset.y / flowState.scale
            };
            
            const targetPos = {
              x: targetItem.position.x + 50 + flowState.offset.x / flowState.scale,
              y: targetItem.position.y + 50 + flowState.offset.y / flowState.scale
            };
            
            return (
              <Connection
                key={connection.id}
                connection={connection}
                sourcePosition={sourcePos}
                targetPosition={targetPos}
                animating={flowState.isAnimating}
              />
            );
          })}
          
          {/* Temporary connection during connect mode */}
          {tempConnection && (
            <path
              className="connection-temp"
              d={calculateConnectionPath(tempConnection.source, tempConnection.target)}
              stroke="#4F46E5"
              strokeWidth="2"
              strokeDasharray="5"
              fill="none"
              opacity="0.6"
            />
          )}
        </svg>
        
        {/* Canvas Items */}
        {flowState.items.map(item => (
          <CanvasItem
            key={item.id}
            item={item}
            position={{
              x: item.position.x + flowState.offset.x / flowState.scale,
              y: item.position.y + flowState.offset.y / flowState.scale
            }}
            selected={item.id === flowState.selectedItemId}
            connectMode={flowState.connectMode && item.id === flowState.sourceItemId}
            onSelect={() => handleSelectItem(item.id)}
            onMove={(newPosition) => handleMoveItem(item.id, newPosition)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        ))}
      </div>
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 bg-white rounded-md shadow-md border border-gray-200 flex z-10">
        <button 
          className="p-2 text-gray-700 hover:bg-gray-100 border-r border-gray-200"
          onClick={() => onUpdateFlowState({...flowState, scale: Math.min(flowState.scale * 1.2, 3)})}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button 
          className="p-2 text-gray-700 hover:bg-gray-100 border-r border-gray-200"
          onClick={() => onUpdateFlowState({...flowState, scale: Math.max(flowState.scale / 1.2, 0.3)})}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button 
          className="p-2 text-gray-700 hover:bg-gray-100"
          onClick={() => onUpdateFlowState({...flowState, scale: 1, offset: {x: 0, y: 0}})}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6"></path>
            <path d="M9 21H3v-6"></path>
            <path d="M21 3l-7 7"></path>
            <path d="M3 21l7-7"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Canvas;
