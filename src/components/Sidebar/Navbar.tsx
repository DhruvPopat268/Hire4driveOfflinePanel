import React from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { useSidebar } from './SidebarContext';

const Navbar = ({ title = "Bike Ride", showBackButton = false, onBackClick = null }) => {
  const { toggleSidebar, isSidebarOpen } = useSidebar();
  
  return (
    <div className="flex items-center justify-between p-4 border-b-2 border-t-2 sticky top-0 z-30 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        
        {/* Company Logo - H4D */}
        <img 
          src="/Hire4driveLogo.png" 
          alt="H4D Logo" 
          className={`h-14 w-auto object-contain transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-64' : 'translate-x-0'
          }`}
        />
        
        {showBackButton && onBackClick && (
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-gray-100 transition-colors ml-2"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        )}
      </div>
      
      {/* Title - Center aligned */}
      <h1 className="text-lg font-semibold text-gray-800 absolute left-1/2 transform -translate-x-1/2">
        {title}
      </h1>
      
      <div className="w-10" />
    </div>
  );
};

export default Navbar;