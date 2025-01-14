// src/components/SideBar.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home,
  LayoutDashboard,
  Inbox,
  Calendar,
  Filter,
  User,
  Menu
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} />, path: '/' },
    { id: 'boards', label: 'Boards', icon: <LayoutDashboard size={20} />, path: '/boards' },
    { id: 'inbox', label: 'Inbox', icon: <Inbox size={20} />, path: '/inbox' },
    { id: 'calendar', label: 'Calendar', icon: <Calendar size={20} />, path: '/calendar' },
    { id: 'filters', label: 'Filters', icon: <Filter size={20} />, path: '/filters' },
  ];

  return (
    <>
      {/* Drawer Toggle Button - Only visible on mobile */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded hover:bg-gray-100"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0 lg:static
          ${isCollapsed ? 'w-0' : 'w-64'}
          flex flex-col
          z-40
        `}
      >
        {/* Logo Section */}
        <div className="h-14 border-b flex items-center px-4">
          <span className={`font-semibold text-xl ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            ProjectPulse
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`
                flex items-center px-4 py-2 my-1 mx-2 cursor-pointer rounded-md
                ${location.pathname === item.path 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'}
              `}
              onClick={() => navigate(item.path)}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span className={`ml-3 ${isCollapsed ? 'hidden' : 'block'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </nav>

        {/* User Profile Button - Fixed at bottom */}
        <div className="border-t p-4">
          <div className="flex items-center cursor-pointer hover:bg-gray-100 rounded-md p-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={16} className="text-gray-600" />
            </div>
            <div className={`ml-3 ${isCollapsed ? 'hidden' : 'block'}`}>
              <div className="text-sm font-medium text-gray-700">User Profile</div>
              <div className="text-xs text-gray-500">View profile</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};

export default Sidebar;