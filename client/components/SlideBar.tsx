// components/Sidebar.tsx
"use client"
import React, { useState } from 'react';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-1/4 bg-gray-800 text-white transition-transform transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Add your navigation links or other content */}
      <button
        onClick={toggleSidebar}
        className='absolute top-4 right-4 text-white focus:outline-none'
      >
        {/* You can use an icon (e.g., hamburger menu) here */}
        {isOpen ? 'Close' : 'Open'}
      </button>
    </aside>
  );
};

export default Sidebar;
