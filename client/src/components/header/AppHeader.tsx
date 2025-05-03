import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, Play, Pause, FileImage, Video, Save, FolderOpen, 
  PlusCircle, Trash, Pointer, Link, Type
} from 'lucide-react';
import { FlowState, saveFlowDiagram, loadFlowDiagram, getSavedDiagramNames } from '@/lib/flowCreator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onStartAnimation: () => void;
  onStopAnimation: () => void;
  onExportGif: () => void;
  onExportVideo: () => void;
  onClearCanvas: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onNewProject: () => void;
  onSaveProject: () => void;
  onLoadProject: (name: string) => void;
  onSelectTool: (tool: 'select' | 'connect' | 'text') => void;
  selectedTool: 'select' | 'connect' | 'text';
  isAnimating: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  onToggleSidebar,
  onStartAnimation,
  onStopAnimation,
  onExportGif,
  onExportVideo,
  onClearCanvas,
  onUndo,
  onRedo,
  onNewProject,
  onSaveProject,
  onLoadProject,
  onSelectTool,
  selectedTool,
  isAnimating,
  canUndo,
  canRedo
}) => {
  const [projectName, setProjectName] = useState('My Flow Diagram');
  const [isRenaming, setIsRenaming] = useState(false);
  
  const handleSaveProject = () => {
    const name = window.prompt('Enter a name for your diagram', projectName);
    if (name) {
      setProjectName(name);
      onSaveProject();
    }
  };
  
  const savedProjects = getSavedDiagramNames();
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.5 3L15.5 5H20V12L18 14L20 16V21H4V16L6 14L4 12V5H8.5L9.5 3H14.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
              <circle cx="12" cy="10" r="3" fill="white" stroke="currentColor"/>
              <path d="M10 15H14L16 18H8L10 15Z" fill="white" stroke="currentColor"/>
            </svg>
            
            {isRenaming ? (
              <input
                type="text"
                className="border rounded px-2 py-1 text-sm"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsRenaming(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsRenaming(false);
                }}
                autoFocus
              />
            ) : (
              <h1 
                className="text-xl font-semibold text-gray-800 cursor-pointer"
                onClick={() => setIsRenaming(true)}
              >
                {projectName}
              </h1>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onNewProject}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> New
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSaveProject}
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FolderOpen className="h-4 w-4 mr-1" /> Open
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {savedProjects.length > 0 ? (
                  savedProjects.map((name) => (
                    <DropdownMenuItem key={name} onClick={() => onLoadProject(name)}>
                      {name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No saved diagrams</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 p-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onNewProject}>
                <PlusCircle className="h-4 w-4 mr-2" /> New Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSaveProject}>
                <Save className="h-4 w-4 mr-2" /> Save Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {savedProjects.length > 0 && (
                <>
                  {savedProjects.map((name) => (
                    <DropdownMenuItem key={name} onClick={() => onLoadProject(name)}>
                      <FolderOpen className="h-4 w-4 mr-2" /> {name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={onExportGif}>
                <FileImage className="h-4 w-4 mr-2" /> Export GIF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportVideo}>
                <Video className="h-4 w-4 mr-2" /> Export Video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-2 flex justify-between">
        <div className="flex space-x-1">
          <Button 
            variant={selectedTool === 'select' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => onSelectTool('select')}
          >
            <Pointer className="h-4 w-4 mr-1" /> Select
          </Button>
          <Button 
            variant={selectedTool === 'connect' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => onSelectTool('connect')}
          >
            <Link className="h-4 w-4 mr-1" /> Connect
          </Button>
          <Button 
            variant={selectedTool === 'text' ? 'secondary' : 'ghost'} 
            size="sm"
            onClick={() => onSelectTool('text')}
          >
            <Type className="h-4 w-4 mr-1" /> Text
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearCanvas}
          >
            <Trash className="h-4 w-4 mr-1" /> Clear
          </Button>
        </div>
        
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            disabled={!canUndo}
            onClick={onUndo}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14L4 9L9 4"></path>
              <path d="M4 9H16C19.866 9 23 12.134 23 16C23 19.866 19.866 23 16 23H7"></path>
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            disabled={!canRedo}
            onClick={onRedo}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 4L20 9L15 14"></path>
              <path d="M20 9H8C4.134 9 1 12.134 1 16C1 19.866 4.134 23 8 23H17"></path>
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
