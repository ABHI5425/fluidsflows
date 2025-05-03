import React, { useState } from 'react';
import { 
  productIcons, 
  businessIcons, 
  architectureIcons, 
  workflowIcons,
  IconType
} from '@/lib/iconData';
import { Search } from 'lucide-react';

interface IconLibraryProps {
  onIconDragStart: (icon: IconType) => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const IconLibrary: React.FC<IconLibraryProps> = ({ 
  onIconDragStart, 
  isMobileOpen,
  onMobileToggle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, icon: IconType) => {
    e.dataTransfer.setData('application/json', JSON.stringify(icon));
    onIconDragStart(icon);
  };
  
  const filterIcons = (icons: IconType[]) => {
    if (!searchTerm) return icons;
    
    return icons.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };
  
  const filteredProductIcons = filterIcons(productIcons);
  const filteredBusinessIcons = filterIcons(businessIcons);
  const filteredArchitectureIcons = filterIcons(architectureIcons);
  const filteredWorkflowIcons = filterIcons(workflowIcons);
  
  const renderIconGrid = (icons: IconType[], title: string) => {
    if (icons.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {icons.map(icon => {
            const IconComponent = icon.icon;
            return (
              <div
                key={icon.id}
                className="icon-item flex flex-col items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
                draggable
                onDragStart={(e) => handleDragStart(e, icon)}
              >
                <div className={`w-10 h-10 flex items-center justify-center ${icon.color}`}>
                  <IconComponent className="text-2xl" />
                </div>
                <span className="text-xs text-center mt-1 text-gray-600">{icon.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <aside 
      className={`w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} h-full absolute md:relative z-30`}
    >
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search icons..." 
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {renderIconGrid(filteredProductIcons, 'Product Management')}
        {renderIconGrid(filteredBusinessIcons, 'Business Process')}
        {renderIconGrid(filteredArchitectureIcons, 'System Architecture')}
        {renderIconGrid(filteredWorkflowIcons, 'Workflow Elements')}
        
        {filteredProductIcons.length === 0 && 
         filteredBusinessIcons.length === 0 && 
         filteredArchitectureIcons.length === 0 && 
         filteredWorkflowIcons.length === 0 && (
           <div className="flex flex-col items-center justify-center h-40 text-gray-400">
             <span className="text-sm">No icons found</span>
             <button 
               className="mt-2 text-primary text-sm hover:underline"
               onClick={() => setSearchTerm('')}
             >
               Clear search
             </button>
           </div>
         )}
      </div>
      
      <button 
        className="md:hidden absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        onClick={onMobileToggle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </aside>
  );
};

export default IconLibrary;
