/**
 * Canvas functionality for the Flow Diagram Creator
 */

// Flow diagram state
let flowState = {
  items: [],
  connections: [],
  isAnimating: false,
  selectedItemId: null,
  selectedConnectionId: null,
  connectMode: false,
  sourceItemId: null,
  scale: 1,
  offset: { x: 0, y: 0 },
  textMode: false
};

// Canvas element
const canvas = document.getElementById('canvas');
const connectionsLayer = document.getElementById('connections-layer');

// Undo/redo state
let undoStack = [];
let redoStack = [];
let tempConnection = null;

// Initialize canvas
function initializeCanvas() {
  // Canvas event listeners
  canvas.addEventListener('dragover', handleCanvasDragOver);
  canvas.addEventListener('drop', handleCanvasDrop);
  canvas.addEventListener('mousedown', handleCanvasMouseDown);
  canvas.addEventListener('mousemove', handleCanvasMouseMove);
  canvas.addEventListener('mouseup', handleCanvasMouseUp);
  canvas.addEventListener('mouseleave', handleCanvasMouseUp);
  canvas.addEventListener('wheel', handleCanvasWheel, { passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Zoom controls
  document.getElementById('zoom-in').addEventListener('click', zoomIn);
  document.getElementById('zoom-out').addEventListener('click', zoomOut);
  document.getElementById('reset-view').addEventListener('click', resetView);
  
  // Tool button event listeners
  document.getElementById('select-tool').addEventListener('click', () => setTool('select'));
  document.getElementById('connect-tool').addEventListener('click', () => setTool('connect'));
  document.getElementById('text-tool').addEventListener('click', () => setTool('text'));
  
  // Animation controls
  document.getElementById('play-animation').addEventListener('click', startAnimation);
  document.getElementById('stop-animation').addEventListener('click', stopAnimation);
  
  // Canvas management
  document.getElementById('clear-canvas').addEventListener('click', clearCanvas);
  document.getElementById('undo').addEventListener('click', undoAction);
  document.getElementById('redo').addEventListener('click', redoAction);
  
  // Keyboard event listeners
  document.addEventListener('keydown', handleKeyDown);
}

// Handle canvas drag over (for dropping icons)
function handleCanvasDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

// Handle dropping icons onto canvas
function handleCanvasDrop(e) {
  e.preventDefault();
  
  try {
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const iconData = JSON.parse(data);
      
      // Get position relative to canvas
      const pos = getRelativeMousePosition(e, canvas);
      
      // Adjust for canvas offset and scale
      const adjustedPos = {
        x: (pos.x - flowState.offset.x) / flowState.scale,
        y: (pos.y - flowState.offset.y) / flowState.scale
      };
      
      // Create new item
      const newItem = {
        id: generateUniqueId(),
        type: 'icon',
        position: adjustedPos,
        iconId: iconData.id,
        selected: false
      };
      
      // Save current state for undo
      saveStateForUndo();
      
      // Add item to flow state
      flowState.items.push(newItem);
      flowState.selectedItemId = newItem.id;
      
      // Update canvas
      updateCanvas();
      updateUndoRedoButtons();
      
      showToast(`Added ${iconData.name} to canvas`);
    }
  } catch (error) {
    console.error('Error adding item to canvas:', error);
  }
}

// Handle mouse down on canvas
function handleCanvasMouseDown(e) {
  // Ignore right clicks
  if (e.button === 2) {
    e.preventDefault();
    return;
  }
  
  const pos = getRelativeMousePosition(e, canvas);
  
  // Check if clicked on an item
  const clickedItem = findItemAtPosition(pos);
  
  if (clickedItem) {
    // If in connect mode and an item is already selected as source
    if (flowState.connectMode && flowState.sourceItemId) {
      // If source and target are different, create connection
      if (flowState.sourceItemId !== clickedItem.id) {
        // Save current state for undo
        saveStateForUndo();
        
        // Create connection
        const newConnection = {
          id: generateUniqueId(),
          sourceId: flowState.sourceItemId,
          targetId: clickedItem.id,
          selected: false,
          animating: false
        };
        
        flowState.connections.push(newConnection);
        flowState.sourceItemId = null;
        
        // Update canvas
        updateCanvas();
        updateUndoRedoButtons();
      }
    } 
    // In select mode, select the item
    else if (!flowState.connectMode && !flowState.textMode) {
      // Save current state for undo
      saveStateForUndo();
      
      // Select item
      flowState.items.forEach(item => item.selected = false);
      flowState.connections.forEach(conn => conn.selected = false);
      
      clickedItem.selected = true;
      flowState.selectedItemId = clickedItem.id;
      flowState.selectedConnectionId = null;
      
      // Start drag
      startDraggingItem(clickedItem, pos);
      
      // Update canvas
      updateCanvas();
    }
    // If in connect mode and no source selected, set as source
    else if (flowState.connectMode && !flowState.sourceItemId) {
      flowState.sourceItemId = clickedItem.id;
      updateCanvas();
    }
  } 
  // Check if clicked on a connection
  else {
    const clickedConnection = findConnectionAtPosition(pos);
    
    if (clickedConnection && !flowState.connectMode && !flowState.textMode) {
      // Save current state for undo
      saveStateForUndo();
      
      // Select connection
      flowState.items.forEach(item => item.selected = false);
      flowState.connections.forEach(conn => conn.selected = false);
      
      clickedConnection.selected = true;
      flowState.selectedItemId = null;
      flowState.selectedConnectionId = clickedConnection.id;
      
      // Update canvas
      updateCanvas();
    }
    // If in text mode, create text label
    else if (flowState.textMode) {
      // Save current state for undo
      saveStateForUndo();
      
      // Create new text label
      const newTextLabel = {
        id: generateUniqueId(),
        type: 'text',
        position: {
          x: (pos.x - flowState.offset.x) / flowState.scale,
          y: (pos.y - flowState.offset.y) / flowState.scale
        },
        text: 'Text Label',
        selected: true
      };
      
      // Update state
      flowState.items.forEach(item => item.selected = false);
      flowState.connections.forEach(conn => conn.selected = false);
      flowState.items.push(newTextLabel);
      flowState.selectedItemId = newTextLabel.id;
      
      // Update canvas
      updateCanvas();
      updateUndoRedoButtons();
      
      // Focus on the new text element for immediate editing
      setTimeout(() => {
        const textElement = document.getElementById(`text-${newTextLabel.id}`);
        if (textElement) {
          textElement.focus();
          textElement.select();
        }
      }, 10);
    }
    // If not clicked on any item or connection, clear selection
    else if (!flowState.connectMode) {
      // Start panning if in select mode
      startPanning(pos);
      
      // Clear selection if not panning
      if (!isPanning) {
        flowState.items.forEach(item => item.selected = false);
        flowState.connections.forEach(conn => conn.selected = false);
        flowState.selectedItemId = null;
        flowState.selectedConnectionId = null;
        updateCanvas();
      }
    }
  }
}

// Start panning the canvas
let isPanning = false;
let panStartPos = { x: 0, y: 0 };

function startPanning(pos) {
  isPanning = true;
  panStartPos = pos;
}

// Handle mouse move on canvas
function handleCanvasMouseMove(e) {
  const pos = getRelativeMousePosition(e, canvas);
  
  // If in connect mode and source is selected, show temporary connection
  if (flowState.connectMode && flowState.sourceItemId) {
    const sourceItem = flowState.items.find(item => item.id === flowState.sourceItemId);
    
    if (sourceItem) {
      const sourceCenter = getItemCenter(sourceItem);
      
      // Update temporary connection
      tempConnection = {
        source: sourceCenter,
        target: pos
      };
      
      // Update connection display
      drawConnections();
    }
  }
  
  // If dragging an item
  if (isDraggingItem) {
    const dx = pos.x - dragStartPos.x;
    const dy = pos.y - dragStartPos.y;
    
    // Update item position
    draggedItem.position.x = dragOriginalPos.x + dx / flowState.scale;
    draggedItem.position.y = dragOriginalPos.y + dy / flowState.scale;
    
    // Update canvas
    updateCanvas();
  }
  
  // If panning the canvas
  if (isPanning) {
    const dx = pos.x - panStartPos.x;
    const dy = pos.y - panStartPos.y;
    
    // Update canvas offset
    flowState.offset.x += dx;
    flowState.offset.y += dy;
    
    // Update start position for next move
    panStartPos = pos;
    
    // Update canvas
    updateCanvas();
  }
}

// Handle mouse up on canvas
function handleCanvasMouseUp() {
  // Stop dragging
  isDraggingItem = false;
  
  // Stop panning
  isPanning = false;
  
  // Clear temporary connection
  tempConnection = null;
  drawConnections();
}

// Handle canvas wheel for zooming
function handleCanvasWheel(e) {
  e.preventDefault();
  
  const pos = getRelativeMousePosition(e, canvas);
  const zoom = e.deltaY < 0 ? 1.1 : 0.9;
  
  // Save current state for undo (only on significant zoom changes)
  if (Math.abs(flowState.scale * zoom - flowState.scale) > 0.1) {
    saveStateForUndo();
  }
  
  // Calculate new scale, limited to reasonable bounds
  const newScale = clamp(flowState.scale * zoom, 0.2, 5);
  
  // Adjust offset to zoom toward cursor position
  flowState.offset.x = pos.x - (pos.x - flowState.offset.x) * (newScale / flowState.scale);
  flowState.offset.y = pos.y - (pos.y - flowState.offset.y) * (newScale / flowState.scale);
  
  // Update scale
  flowState.scale = newScale;
  
  // Update canvas
  updateCanvas();
}

// Zoom in button handler
function zoomIn() {
  // Save current state for undo
  saveStateForUndo();
  
  // Calculate new scale
  const newScale = clamp(flowState.scale * 1.2, 0.2, 5);
  
  // Get canvas center
  const canvasCenter = {
    x: canvas.clientWidth / 2,
    y: canvas.clientHeight / 2
  };
  
  // Adjust offset to zoom toward center
  flowState.offset.x = canvasCenter.x - (canvasCenter.x - flowState.offset.x) * (newScale / flowState.scale);
  flowState.offset.y = canvasCenter.y - (canvasCenter.y - flowState.offset.y) * (newScale / flowState.scale);
  
  // Update scale
  flowState.scale = newScale;
  
  // Update canvas
  updateCanvas();
  updateUndoRedoButtons();
}

// Zoom out button handler
function zoomOut() {
  // Save current state for undo
  saveStateForUndo();
  
  // Calculate new scale
  const newScale = clamp(flowState.scale / 1.2, 0.2, 5);
  
  // Get canvas center
  const canvasCenter = {
    x: canvas.clientWidth / 2,
    y: canvas.clientHeight / 2
  };
  
  // Adjust offset to zoom toward center
  flowState.offset.x = canvasCenter.x - (canvasCenter.x - flowState.offset.x) * (newScale / flowState.scale);
  flowState.offset.y = canvasCenter.y - (canvasCenter.y - flowState.offset.y) * (newScale / flowState.scale);
  
  // Update scale
  flowState.scale = newScale;
  
  // Update canvas
  updateCanvas();
  updateUndoRedoButtons();
}

// Reset view button handler
function resetView() {
  // Save current state for undo
  saveStateForUndo();
  
  // Reset scale and offset
  flowState.scale = 1;
  flowState.offset = { x: 0, y: 0 };
  
  // Update canvas
  updateCanvas();
  updateUndoRedoButtons();
}

// Item dragging state
let isDraggingItem = false;
let draggedItem = null;
let dragStartPos = { x: 0, y: 0 };
let dragOriginalPos = { x: 0, y: 0 };

// Start dragging an item
function startDraggingItem(item, startPos) {
  isDraggingItem = true;
  draggedItem = item;
  dragStartPos = startPos;
  dragOriginalPos = { ...item.position };
}

// Find item at position
function findItemAtPosition(pos) {
  // Check in reverse order (top items first)
  for (let i = flowState.items.length - 1; i >= 0; i--) {
    const item = flowState.items[i];
    const itemPos = {
      x: item.position.x * flowState.scale + flowState.offset.x,
      y: item.position.y * flowState.scale + flowState.offset.y
    };
    
    // Size depends on item type
    let width, height;
    if (item.type === 'icon') {
      width = 100 * flowState.scale;
      height = 100 * flowState.scale;
    } else if (item.type === 'text') {
      const textElement = document.getElementById(`text-${item.id}`);
      if (textElement) {
        width = textElement.offsetWidth;
        height = textElement.offsetHeight;
      } else {
        width = 100 * flowState.scale;
        height = 30 * flowState.scale;
      }
    }
    
    // Check if point is inside item
    if (
      pos.x >= itemPos.x &&
      pos.x <= itemPos.x + width &&
      pos.y >= itemPos.y &&
      pos.y <= itemPos.y + height
    ) {
      return item;
    }
  }
  
  return null;
}

// Find connection at position
function findConnectionAtPosition(pos) {
  const hitDistance = 10; // px
  
  for (let i = 0; i < flowState.connections.length; i++) {
    const conn = flowState.connections[i];
    
    // Get source and target items
    const sourceItem = flowState.items.find(item => item.id === conn.sourceId);
    const targetItem = flowState.items.find(item => item.id === conn.targetId);
    
    if (sourceItem && targetItem) {
      const sourceCenter = getItemCenter(sourceItem);
      const targetCenter = getItemCenter(targetItem);
      
      // Simple line distance check (this is a simplified approach)
      const lineLength = getDistance(sourceCenter, targetCenter);
      
      // Calculate distances
      const distToSource = getDistance(pos, sourceCenter);
      const distToTarget = getDistance(pos, targetCenter);
      
      // If within range of the line
      if (distToSource + distToTarget <= lineLength + hitDistance) {
        return conn;
      }
    }
  }
  
  return null;
}

// Get center point of an item
function getItemCenter(item) {
  let width = 100, height = 100;
  
  if (item.type === 'text') {
    const textElement = document.getElementById(`text-${item.id}`);
    if (textElement) {
      width = textElement.offsetWidth / flowState.scale;
      height = textElement.offsetHeight / flowState.scale;
    } else {
      width = 100;
      height = 30;
    }
  }
  
  return {
    x: (item.position.x + width / 2) * flowState.scale + flowState.offset.x,
    y: (item.position.y + height / 2) * flowState.scale + flowState.offset.y
  };
}

// Update the canvas
function updateCanvas() {
  // Update the grid to match scale and offset
  updateGridBackground();
  
  // Draw all connections
  drawConnections();
  
  // Remove all existing items
  const existingItems = document.querySelectorAll('.canvas-item, .text-label');
  existingItems.forEach(item => item.remove());
  
  // Draw all items
  flowState.items.forEach(item => {
    if (item.type === 'icon') {
      drawIconItem(item);
    } else if (item.type === 'text') {
      drawTextItem(item);
    }
  });
}

// Update grid background
function updateGridBackground() {
  const gridSize = 20 * flowState.scale;
  
  canvas.style.backgroundSize = `${gridSize}px ${gridSize}px`;
  canvas.style.backgroundPosition = `${flowState.offset.x % gridSize}px ${flowState.offset.y % gridSize}px`;
}

// Draw connections
function drawConnections() {
  // Clear connections SVG
  while (connectionsLayer.firstChild) {
    if (connectionsLayer.lastChild.tagName !== 'defs') {
      connectionsLayer.removeChild(connectionsLayer.lastChild);
    } else {
      break;
    }
  }
  
  // Draw all connections
  flowState.connections.forEach(conn => {
    const sourceItem = flowState.items.find(item => item.id === conn.sourceId);
    const targetItem = flowState.items.find(item => item.id === conn.targetId);
    
    if (sourceItem && targetItem) {
      const sourceCenter = getItemCenter(sourceItem);
      const targetCenter = getItemCenter(targetItem);
      
      drawConnection(conn, sourceCenter, targetCenter);
    }
  });
  
  // Draw temporary connection if in connect mode
  if (tempConnection) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', calculateConnectionPath(tempConnection.source, tempConnection.target));
    path.setAttribute('stroke', '#4F46E5');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '5');
    path.setAttribute('fill', 'none');
    path.setAttribute('opacity', '0.6');
    
    connectionsLayer.appendChild(path);
  }
}

// Draw a single connection
function drawConnection(conn, source, target) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  
  path.setAttribute('id', `connection-${conn.id}`);
  path.setAttribute('d', calculateConnectionPath(source, target));
  path.setAttribute('stroke', conn.selected ? '#3B82F6' : '#4A5568');
  path.setAttribute('stroke-width', conn.selected ? '3' : '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('marker-end', 'url(#arrowhead)');
  
  if (conn.animating || flowState.isAnimating) {
    path.setAttribute('class', 'connection animated');
  } else {
    path.setAttribute('class', 'connection');
  }
  
  connectionsLayer.appendChild(path);
}

// Draw an icon item
function drawIconItem(item) {
  const iconData = getIconById(item.iconId);
  if (!iconData) return;
  
  const itemElement = document.createElement('div');
  itemElement.id = `item-${item.id}`;
  itemElement.className = `canvas-item ${item.selected ? 'selected' : ''} ${flowState.sourceItemId === item.id ? 'connect-source' : ''}`;
  
  // Position the item
  itemElement.style.left = `${item.position.x * flowState.scale + flowState.offset.x}px`;
  itemElement.style.top = `${item.position.y * flowState.scale + flowState.offset.y}px`;
  itemElement.style.transform = `scale(${flowState.scale})`;
  itemElement.style.transformOrigin = 'top left';
  
  // Add icon
  const iconElement = document.createElement('div');
  iconElement.className = 'canvas-item-icon';
  iconElement.innerHTML = `<i class="${iconData.icon}" style="color: ${iconData.color}"></i>`;
  
  // Add label
  const labelElement = document.createElement('div');
  labelElement.className = 'canvas-item-label';
  labelElement.textContent = iconData.name;
  
  // Add to item
  itemElement.appendChild(iconElement);
  itemElement.appendChild(labelElement);
  
  // Add to canvas
  canvas.appendChild(itemElement);
}

// Draw a text item
function drawTextItem(item) {
  const textElement = document.createElement('div');
  textElement.id = `text-${item.id}`;
  textElement.className = `text-label ${item.selected ? 'selected' : ''}`;
  textElement.contentEditable = true;
  textElement.textContent = item.text;
  
  // Position the item
  textElement.style.left = `${item.position.x * flowState.scale + flowState.offset.x}px`;
  textElement.style.top = `${item.position.y * flowState.scale + flowState.offset.y}px`;
  textElement.style.transformOrigin = 'top left';
  
  // Add event listeners
  textElement.addEventListener('blur', () => {
    // Update text content
    item.text = textElement.textContent;
  });
  
  textElement.addEventListener('keydown', (e) => {
    // Prevent new line and stop propagation
    if (e.key === 'Enter') {
      e.preventDefault();
      textElement.blur();
    }
  });
  
  // Add to canvas
  canvas.appendChild(textElement);
}

// Set active tool
function setTool(tool) {
  // Reset all tool buttons
  document.getElementById('select-tool').classList.remove('active');
  document.getElementById('connect-tool').classList.remove('active');
  document.getElementById('text-tool').classList.remove('active');
  
  // Update state based on selected tool
  flowState.connectMode = tool === 'connect';
  flowState.textMode = tool === 'text';
  
  // If switched from connect mode, clear source
  if (tool !== 'connect') {
    flowState.sourceItemId = null;
  }
  
  // Activate the selected tool button
  document.getElementById(`${tool}-tool`).classList.add('active');
  
  // Update cursor
  if (tool === 'connect') {
    canvas.style.cursor = 'crosshair';
  } else if (tool === 'text') {
    canvas.style.cursor = 'text';
  } else {
    canvas.style.cursor = 'grab';
  }
  
  // Update canvas
  updateCanvas();
}

// Start animation
function startAnimation() {
  // Save current state for undo
  saveStateForUndo();
  
  // Update state
  flowState.isAnimating = true;
  
  // Update animation controls
  document.getElementById('play-animation').style.display = 'none';
  document.getElementById('stop-animation').style.display = 'inline-flex';
  
  // Update canvas
  updateCanvas();
  updateUndoRedoButtons();
}

// Stop animation
function stopAnimation() {
  // Save current state for undo
  saveStateForUndo();
  
  // Update state
  flowState.isAnimating = false;
  
  // Update animation controls
  document.getElementById('play-animation').style.display = 'inline-flex';
  document.getElementById('stop-animation').style.display = 'none';
  
  // Update canvas
  updateCanvas();
  updateUndoRedoButtons();
}

// Clear canvas
function clearCanvas() {
  if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
    // Save current state for undo
    saveStateForUndo();
    
    // Clear state
    flowState.items = [];
    flowState.connections = [];
    flowState.selectedItemId = null;
    flowState.selectedConnectionId = null;
    flowState.sourceItemId = null;
    
    // Update canvas
    updateCanvas();
    updateUndoRedoButtons();
    
    showToast('Canvas cleared');
  }
}

// Save current state for undo
function saveStateForUndo() {
  undoStack.push(JSON.parse(JSON.stringify(flowState)));
  redoStack = [];
  updateUndoRedoButtons();
}

// Undo last action
function undoAction() {
  if (undoStack.length > 0) {
    // Save current state for redo
    redoStack.push(JSON.parse(JSON.stringify(flowState)));
    
    // Restore previous state
    flowState = undoStack.pop();
    
    // Update canvas
    updateCanvas();
    updateUndoRedoButtons();
  }
}

// Redo last undone action
function redoAction() {
  if (redoStack.length > 0) {
    // Save current state for undo
    undoStack.push(JSON.parse(JSON.stringify(flowState)));
    
    // Restore next state
    flowState = redoStack.pop();
    
    // Update canvas
    updateCanvas();
    updateUndoRedoButtons();
  }
}

// Update undo/redo button states
function updateUndoRedoButtons() {
  document.getElementById('undo').disabled = undoStack.length === 0;
  document.getElementById('redo').disabled = redoStack.length === 0;
}

// Handle keyboard shortcuts
function handleKeyDown(e) {
  // Ignore if in a text input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
    return;
  }
  
  // Delete key - delete selected item or connection
  if (e.key === 'Delete' || e.key === 'Backspace') {
    deleteSelected();
  }
  
  // Undo/redo
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        redoAction();
      } else {
        undoAction();
      }
    } else if (e.key === 'y') {
      e.preventDefault();
      redoAction();
    }
  }
  
  // Escape key - exit connect mode, clear selection
  if (e.key === 'Escape') {
    flowState.connectMode = false;
    flowState.sourceItemId = null;
    flowState.textMode = false;
    setTool('select');
    updateCanvas();
  }
}

// Delete selected item or connection
function deleteSelected() {
  if (flowState.selectedItemId) {
    // Save current state for undo
    saveStateForUndo();
    
    // Remove selected item
    flowState.items = flowState.items.filter(item => item.id !== flowState.selectedItemId);
    
    // Remove any connections involving this item
    flowState.connections = flowState.connections.filter(
      conn => conn.sourceId !== flowState.selectedItemId && conn.targetId !== flowState.selectedItemId
    );
    
    // Clear selection
    flowState.selectedItemId = null;
    
    // Update canvas
    updateCanvas();
    updateUndoRedoButtons();
    
    showToast('Item deleted');
  } else if (flowState.selectedConnectionId) {
    // Save current state for undo
    saveStateForUndo();
    
    // Remove selected connection
    flowState.connections = flowState.connections.filter(conn => conn.id !== flowState.selectedConnectionId);
    
    // Clear selection
    flowState.selectedConnectionId = null;
    
    // Update canvas
    updateCanvas();
    updateUndoRedoButtons();
    
    showToast('Connection deleted');
  }
}

// Save flow diagram
function saveFlowDiagram(name) {
  try {
    // Save diagram state
    saveToLocalStorage(`flowdiagram_${name}`, flowState);
    
    // Save name to list
    saveDiagramName(name);
    
    showToast('Diagram saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving diagram:', error);
    showToast('Error saving diagram', 'Save Failed', 'error');
    return false;
  }
}

// Load flow diagram
function loadFlowDiagram(name) {
  try {
    const savedState = loadFromLocalStorage(`flowdiagram_${name}`);
    
    if (savedState) {
      // Save current state for undo
      saveStateForUndo();
      
      // Load state
      flowState = savedState;
      
      // Update canvas
      updateCanvas();
      updateUndoRedoButtons();
      
      showToast(`Diagram "${name}" loaded successfully`);
      return true;
    } else {
      showToast(`No diagram found with name "${name}"`, 'Load Failed', 'error');
      return false;
    }
  } catch (error) {
    console.error('Error loading diagram:', error);
    showToast('Error loading diagram', 'Load Failed', 'error');
    return false;
  }
}

// Get flow state
function getFlowState() {
  return flowState;
}