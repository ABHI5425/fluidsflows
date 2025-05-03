import { IconType } from './iconData';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasItem {
  id: string;
  position: Point;
  icon: IconType;
  selected: boolean;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePosition?: Point;
  targetPosition?: Point;
  animating: boolean;
}

export interface FlowState {
  items: CanvasItem[];
  connections: Connection[];
  isAnimating: boolean;
  selectedItemId: string | null;
  connectMode: boolean;
  sourceItemId: string | null;
  scale: number;
  offset: Point;
}

export const initialFlowState: FlowState = {
  items: [],
  connections: [],
  isAnimating: false,
  selectedItemId: null,
  connectMode: false,
  sourceItemId: null,
  scale: 1,
  offset: { x: 0, y: 0 }
};

export const getCanvasItemPosition = (
  item: CanvasItem, 
  centerX: number = 0, 
  centerY: number = 0
): Point => {
  return {
    x: (item.position.x * centerX) + centerX,
    y: (item.position.y * centerY) + centerY
  };
};

export const calculateConnectionPath = (source: Point, target: Point): string => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  
  // Create a bezier curve path
  const controlPointX1 = source.x + dx * 0.5;
  const controlPointY1 = source.y;
  
  const controlPointX2 = target.x - dx * 0.5;
  const controlPointY2 = target.y;
  
  return `M${source.x},${source.y} C${controlPointX1},${controlPointY1} ${controlPointX2},${controlPointY2} ${target.x},${target.y}`;
};

// Save flow diagram to local storage
export const saveFlowDiagram = (name: string, state: FlowState): void => {
  try {
    const savedDiagrams = JSON.parse(localStorage.getItem('flowDiagrams') || '{}');
    savedDiagrams[name] = state;
    localStorage.setItem('flowDiagrams', JSON.stringify(savedDiagrams));
  } catch (error) {
    console.error('Failed to save flow diagram:', error);
  }
};

// Load flow diagram from local storage
export const loadFlowDiagram = (name: string): FlowState | null => {
  try {
    const savedDiagrams = JSON.parse(localStorage.getItem('flowDiagrams') || '{}');
    return savedDiagrams[name] || null;
  } catch (error) {
    console.error('Failed to load flow diagram:', error);
    return null;
  }
};

// Get all saved diagram names
export const getSavedDiagramNames = (): string[] => {
  try {
    const savedDiagrams = JSON.parse(localStorage.getItem('flowDiagrams') || '{}');
    return Object.keys(savedDiagrams);
  } catch (error) {
    console.error('Failed to get saved diagram names:', error);
    return [];
  }
};
