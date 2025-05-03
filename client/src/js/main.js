/**
 * Main entry point for the Flow Diagram Creator
 */

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Initialize the application
function initApp() {
  try {
    // Initialize icon library
    initializeCategoryCollapsible();
    initializeIconDragHandlers();
    
    // Initialize canvas
    initializeCanvas();
    
    // Initialize export functionality
    initializeExport();
    
    // Add event listeners for sidebar toggle on mobile
    initializeSidebar();
    
    // Add event listeners for save/load
    initializeSaveLoad();
    
    // Show welcome toast
    showToast('Welcome to Flow Creator!', 'Drag icons to create your flow diagram');
    
  } catch (error) {
    console.error('Error initializing application:', error);
    showToast('Error initializing application', 'Please refresh the page', 'error');
  }
}

// Initialize sidebar toggle for mobile
function initializeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  
  // Create toggle button for mobile
  const toggleButton = document.createElement('button');
  toggleButton.className = 'sidebar-toggle';
  toggleButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
  toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    toggleButton.innerHTML = sidebar.classList.contains('open') 
      ? '<i class="fas fa-chevron-left"></i>' 
      : '<i class="fas fa-chevron-right"></i>';
  });
  
  // Add toggle button to sidebar
  sidebar.appendChild(toggleButton);
  
  // Handle resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('open');
    }
  });
}

// Initialize save/load functionality
function initializeSaveLoad() {
  // Add save button to header
  const toolbar = document.querySelector('.toolbar');
  const saveButton = document.createElement('button');
  saveButton.id = 'save-diagram';
  saveButton.className = 'tool-button';
  saveButton.title = 'Save Diagram';
  saveButton.innerHTML = '<i class="fas fa-save"></i>';
  
  const loadButton = document.createElement('button');
  loadButton.id = 'load-diagram';
  loadButton.className = 'tool-button';
  loadButton.title = 'Load Diagram';
  loadButton.innerHTML = '<i class="fas fa-folder-open"></i>';
  
  // Add divider
  const divider = document.createElement('div');
  divider.className = 'divider';
  
  // Add buttons to toolbar (before clear button)
  const clearButton = document.getElementById('clear-canvas');
  toolbar.insertBefore(saveButton, clearButton);
  toolbar.insertBefore(loadButton, clearButton);
  toolbar.insertBefore(divider, clearButton);
  
  // Add event listeners
  saveButton.addEventListener('click', () => {
    // Prompt for name
    const name = prompt('Enter a name for your diagram:', 'My Flow Diagram');
    if (name) {
      saveFlowDiagram(name);
    }
  });
  
  loadButton.addEventListener('click', () => {
    // Get saved diagrams
    const diagrams = getSavedDiagramNames();
    
    if (diagrams.length === 0) {
      showToast('No saved diagrams found', 'Save a diagram first', 'error');
      return;
    }
    
    // Create a simple dialog to select a diagram
    const selectDialog = document.createElement('div');
    selectDialog.className = 'modal open';
    
    const dialogContent = document.createElement('div');
    dialogContent.className = 'modal-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = '<h3>Load Diagram</h3><button class="close-button">&times;</button>';
    
    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    // Create diagram list
    const list = document.createElement('div');
    list.className = 'diagram-list';
    
    diagrams.forEach(diagram => {
      const item = document.createElement('div');
      item.className = 'diagram-item';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = diagram;
      
      const loadBtn = document.createElement('button');
      loadBtn.className = 'button primary';
      loadBtn.textContent = 'Load';
      loadBtn.addEventListener('click', () => {
        loadFlowDiagram(diagram);
        document.body.removeChild(selectDialog);
      });
      
      item.appendChild(nameSpan);
      item.appendChild(loadBtn);
      list.appendChild(item);
    });
    
    body.appendChild(list);
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'button secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(selectDialog);
    });
    
    footer.appendChild(cancelButton);
    
    // Add everything to the dialog
    dialogContent.appendChild(header);
    dialogContent.appendChild(body);
    dialogContent.appendChild(footer);
    selectDialog.appendChild(dialogContent);
    
    // Add close button event
    header.querySelector('.close-button').addEventListener('click', () => {
      document.body.removeChild(selectDialog);
    });
    
    // Add dialog to body
    document.body.appendChild(selectDialog);
    
    // Add some styles specifically for diagram list
    const style = document.createElement('style');
    style.textContent = `
      .diagram-list {
        max-height: 300px;
        overflow-y: auto;
      }
      .diagram-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border-bottom: 1px solid var(--medium-gray);
      }
      .diagram-item:last-child {
        border-bottom: none;
      }
    `;
    document.head.appendChild(style);
  });
}