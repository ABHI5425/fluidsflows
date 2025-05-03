/**
 * Utility functions for the Flow Diagram Creator
 */

// Generate a unique ID
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Calculate path for connection between two points
function calculateConnectionPath(source, target) {
  // Get the direction vector
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  
  // Normalize to get direction
  const length = Math.sqrt(dx * dx + dy * dy);
  const dirX = dx / length;
  const dirY = dy / length;
  
  // Define control points for the curve
  const cpOffset = length * 0.4;
  
  // Create the path
  return `M ${source.x} ${source.y} 
          C ${source.x + cpOffset * dirX} ${source.y}, 
            ${target.x - cpOffset * dirX} ${target.y}, 
            ${target.x} ${target.y}`;
}

// Create a toast notification
function showToast(message, title = '', type = 'success', duration = 3000) {
  const toastContainer = document.getElementById('toast-container');
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Create toast content
  const content = document.createElement('div');
  content.className = 'toast-content';
  
  if (title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;
    content.appendChild(titleEl);
  }
  
  const messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  content.appendChild(messageEl);
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'toast-close';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = () => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  };
  
  // Add elements to toast
  toast.appendChild(content);
  toast.appendChild(closeButton);
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Save data to localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Load data from localStorage
function loadFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Get saved diagram names
function getSavedDiagramNames() {
  const diagramsKey = 'flowdiagrams_list';
  const list = loadFromLocalStorage(diagramsKey) || [];
  return list;
}

// Save diagram name to list
function saveDiagramName(name) {
  const diagramsKey = 'flowdiagrams_list';
  const list = getSavedDiagramNames();
  
  if (!list.includes(name)) {
    list.push(name);
    saveToLocalStorage(diagramsKey, list);
  }
}

// Download file
function downloadFile(data, filename, type) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Get mouse position relative to an element
function getRelativeMousePosition(event, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

// Clamp a value between min and max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Convert hex color to rgba
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Get distance between two points
function getDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Check if point is inside rectangle
function isPointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// Format current date and time
function formatDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}