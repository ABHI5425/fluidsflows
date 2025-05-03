import React, { useState, useRef, useEffect } from 'react';
import Canvas from '@/components/canvas/Canvas';
import IconLibrary from '@/components/sidebar/IconLibrary';
import AppHeader from '@/components/header/AppHeader';
import ExportModal, { ExportOptions } from '@/components/modal/ExportModal';
import { 
  FlowState, 
  CanvasItem, 
  initialFlowState, 
  saveFlowDiagram, 
  loadFlowDiagram,
  Point
} from '@/lib/flowCreator';
import { IconType } from '@/lib/iconData';
import { generateUniqueId } from '@/lib/utils';
import { exportToGIF, exportToVideo } from '@/lib/exportUtils';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

const FlowCreator = () => {
  const [flowState, setFlowState] = useState<FlowState>(initialFlowState);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedTool, setSelectedTool] = useState<'select' | 'connect' | 'text'>('select');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'gif' | 'video'>('gif');
  const [undoStack, setUndoStack] = useState<FlowState[]>([]);
  const [redoStack, setRedoStack] = useState<FlowState[]>([]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Update flow state while tracking undo/redo
  const updateFlowState = (newState: FlowState) => {
    setUndoStack([...undoStack, flowState]);
    setRedoStack([]);
    setFlowState(newState);
  };
  
  // Tool selection
  useEffect(() => {
    const newState = { ...flowState };
    
    if (selectedTool === 'connect') {
      newState.connectMode = true;
    } else {
      newState.connectMode = false;
      newState.sourceItemId = null;
    }
    
    setFlowState(newState);
  }, [selectedTool]);
  
  // Handle icon drag start
  const handleIconDragStart = (icon: IconType) => {
    // This is handled in the onDrop handler
  };
  
  // Handle canvas drop for new items
  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    try {
      const iconData = JSON.parse(e.dataTransfer.getData('application/json')) as IconType;
      
      // Calculate position relative to canvas
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      const position = {
        x: (e.clientX - canvasRect.left - (flowState.offset.x)) / flowState.scale,
        y: (e.clientY - canvasRect.top - (flowState.offset.y)) / flowState.scale
      };
      
      // Create new canvas item
      const newItem: CanvasItem = {
        id: generateUniqueId(),
        position,
        icon: iconData,
        selected: false
      };
      
      updateFlowState({
        ...flowState,
        items: [...flowState.items, newItem],
        selectedItemId: newItem.id
      });
    } catch (error) {
      console.error('Error adding item to canvas:', error);
    }
  };
  
  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  // Animation controls
  const handleStartAnimation = () => {
    const newState = { ...flowState, isAnimating: true };
    setFlowState(newState);
  };
  
  const handleStopAnimation = () => {
    const newState = { ...flowState, isAnimating: false };
    setFlowState(newState);
  };
  
  // Export functions
  const handleExportGif = () => {
    setExportType('gif');
    setExportModalOpen(true);
  };
  
  const handleExportVideo = () => {
    setExportType('video');
    setExportModalOpen(true);
  };
  
  const handleExport = async (options: ExportOptions) => {
    try {
      if (!canvasRef.current) return;
      
      toast({
        title: `Exporting ${options.type === 'gif' ? 'GIF' : 'Video'}...`,
        description: "This may take a few moments.",
      });
      
      if (options.type === 'gif') {
        await exportToGIF(canvasRef.current, flowState, {
          filename: options.filename,
          quality: options.quality,
          speed: options.speed
        });
      } else {
        await exportToVideo(canvasRef.current, flowState, {
          filename: options.filename,
          quality: options.quality,
          speed: options.speed
        });
      }
      
      toast({
        title: "Export Complete",
        description: `Your ${options.type === 'gif' ? 'GIF' : 'Video'} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `There was an error exporting your animation.`,
        variant: "destructive"
      });
      console.error('Export error:', error);
    }
  };
  
  // Project management
  const handleNewProject = () => {
    if (flowState.items.length > 0) {
      if (window.confirm('Create a new project? Unsaved changes will be lost.')) {
        setFlowState(initialFlowState);
        setUndoStack([]);
        setRedoStack([]);
      }
    } else {
      setFlowState(initialFlowState);
      setUndoStack([]);
      setRedoStack([]);
    }
  };
  
  const handleSaveProject = () => {
    try {
      saveFlowDiagram('my-flow-diagram', flowState);
      toast({
        title: "Project Saved",
        description: "Your flow diagram has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your diagram.",
        variant: "destructive"
      });
    }
  };
  
  const handleLoadProject = (name: string) => {
    try {
      const loadedState = loadFlowDiagram(name);
      if (loadedState) {
        setFlowState(loadedState);
        setUndoStack([]);
        setRedoStack([]);
        toast({
          title: "Project Loaded",
          description: `"${name}" has been loaded successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "There was an error loading your diagram.",
        variant: "destructive"
      });
    }
  };
  
  // Clear canvas
  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      updateFlowState({
        ...flowState,
        items: [],
        connections: [],
        selectedItemId: null
      });
    }
  };
  
  // Undo/Redo
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, undoStack.length - 1);
      
      setRedoStack([...redoStack, flowState]);
      setUndoStack(newUndoStack);
      setFlowState(previousState);
    }
  };
  
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, redoStack.length - 1);
      
      setUndoStack([...undoStack, flowState]);
      setRedoStack(newRedoStack);
      setFlowState(nextState);
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
      <AppHeader 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onStartAnimation={handleStartAnimation}
        onStopAnimation={handleStopAnimation}
        onExportGif={handleExportGif}
        onExportVideo={handleExportVideo}
        onClearCanvas={handleClearCanvas}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNewProject={handleNewProject}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onSelectTool={setSelectedTool}
        selectedTool={selectedTool}
        isAnimating={flowState.isAnimating}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <IconLibrary 
          onIconDragStart={handleIconDragStart}
          isMobileOpen={isSidebarOpen}
          onMobileToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white p-2 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <button 
                className={`px-3 py-1.5 rounded font-medium text-white bg-primary hover:bg-primary/90 text-sm ${flowState.isAnimating ? 'hidden' : ''}`}
                onClick={handleStartAnimation}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Play Animation
              </button>
              <button 
                className={`px-3 py-1.5 rounded font-medium text-gray-700 hover:bg-gray-100 text-sm ${!flowState.isAnimating ? 'hidden' : ''}`}
                onClick={handleStopAnimation}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
                Stop
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="px-3 py-1.5 rounded font-medium text-gray-700 hover:bg-gray-100 text-sm"
                onClick={handleExportGif}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <path d="M9 9 L9 15"></path>
                  <path d="M15 9 L15 15"></path>
                </svg>
                Export GIF
              </button>
              <button 
                className="px-3 py-1.5 rounded font-medium text-gray-700 hover:bg-gray-100 text-sm"
                onClick={handleExportVideo}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 8L16 12L22 16V8Z"></path>
                  <rect x="2" y="6" width="12" height="12" rx="2"></rect>
                </svg>
                Export Video
              </button>
            </div>
          </div>
          
          <div 
            ref={canvasRef} 
            className="flex-1 overflow-hidden relative bg-gray-100"
          >
            <Canvas 
              flowState={flowState}
              onUpdateFlowState={updateFlowState}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
            />
          </div>
        </main>
      </div>
      
      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        exportType={exportType}
      />
      
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: 1000;
          }
        }
        
        .animate-connection {
          animation: dash 30s linear infinite;
        }
        
        .icon-item {
          transition: transform 0.1s ease-in-out;
        }
        
        .icon-item:hover {
          transform: scale(1.05);
          cursor: grab;
        }
        
        .icon-item:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default FlowCreator;
