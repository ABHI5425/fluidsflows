/**
 * Icon definitions for the Flow Diagram Creator
 */

// Icon definitions with metadata
const ICONS = {
  // Business Process Icons
  'process': {
    id: 'process',
    name: 'Process',
    category: 'business',
    icon: 'fas fa-project-diagram',
    color: '#4F46E5'
  },
  'document': {
    id: 'document',
    name: 'Document',
    category: 'business',
    icon: 'fas fa-file-alt',
    color: '#4F46E5'
  },
  'user': {
    id: 'user',
    name: 'User',
    category: 'business',
    icon: 'fas fa-user',
    color: '#4F46E5'
  },
  'database': {
    id: 'database',
    name: 'Database',
    category: 'business',
    icon: 'fas fa-database',
    color: '#4F46E5'
  },
  'decision': {
    id: 'decision',
    name: 'Decision',
    category: 'business',
    icon: 'fas fa-question-circle',
    color: '#4F46E5'
  },
  
  // Workflow Elements
  'start': {
    id: 'start',
    name: 'Start',
    category: 'workflow',
    icon: 'fas fa-play-circle',
    color: '#10B981'
  },
  'end': {
    id: 'end',
    name: 'End',
    category: 'workflow',
    icon: 'fas fa-stop-circle',
    color: '#EF4444'
  },
  'flow': {
    id: 'flow',
    name: 'Flow',
    category: 'workflow',
    icon: 'fas fa-exchange-alt',
    color: '#4F46E5'
  },
  'branch': {
    id: 'branch',
    name: 'Branch',
    category: 'workflow',
    icon: 'fas fa-code-branch',
    color: '#4F46E5'
  },
  'merge': {
    id: 'merge',
    name: 'Merge',
    category: 'workflow',
    icon: 'fas fa-compress-alt',
    color: '#4F46E5'
  },
  
  // System Architecture
  'server': {
    id: 'server',
    name: 'Server',
    category: 'architecture',
    icon: 'fas fa-server',
    color: '#4F46E5'
  },
  'cloud': {
    id: 'cloud',
    name: 'Cloud',
    category: 'architecture',
    icon: 'fas fa-cloud',
    color: '#4F46E5'
  },
  'mobile': {
    id: 'mobile',
    name: 'Mobile',
    category: 'architecture',
    icon: 'fas fa-mobile-alt',
    color: '#4F46E5'
  },
  'desktop': {
    id: 'desktop',
    name: 'Desktop',
    category: 'architecture',
    icon: 'fas fa-desktop',
    color: '#4F46E5'
  },
  'api': {
    id: 'api',
    name: 'API',
    category: 'architecture',
    icon: 'fas fa-cogs',
    color: '#4F46E5'
  }
};

// Get icon by ID
function getIconById(id) {
  return ICONS[id] || null;
}

// Get all icons in a category
function getIconsByCategory(category) {
  return Object.values(ICONS).filter(icon => icon.category === category);
}

// Get all categories
function getAllCategories() {
  const categories = new Set(Object.values(ICONS).map(icon => icon.category));
  return Array.from(categories);
}

// Initialize icon drag functionality
function initializeIconDragHandlers() {
  const iconItems = document.querySelectorAll('.icon-item');
  
  iconItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      const iconId = item.getAttribute('data-icon');
      const iconData = getIconById(iconId);
      
      if (iconData) {
        e.dataTransfer.setData('application/json', JSON.stringify(iconData));
        e.dataTransfer.effectAllowed = 'copy';
        
        // Create a drag image
        const dragImage = document.createElement('div');
        dragImage.classList.add('icon-drag-image');
        dragImage.innerHTML = `<i class="${iconData.icon}"></i>`;
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 25, 25);
        
        // Schedule removal of the drag image
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 0);
      }
    });
  });
}

// Initialize category collapsible behavior
function initializeCategoryCollapsible() {
  const categoryHeaders = document.querySelectorAll('.category-header');
  
  categoryHeaders.forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      const categoryItems = header.nextElementSibling;
      
      if (header.classList.contains('collapsed')) {
        categoryItems.style.display = 'none';
      } else {
        categoryItems.style.display = 'grid';
      }
    });
  });
}