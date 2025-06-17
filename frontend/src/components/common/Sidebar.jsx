// filepath: e:\web-doan-third\web-doan-cnpm\src\components\common\Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Sidebar = ({ 
  items = [], 
  isOpen = true,
  onToggle = () => {},
  activePath = '',
  userName = '',
  userRole = ''
}) => {
  return (
    <aside 
      className={`bg-white shadow-md h-screen transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b">
        {isOpen ? (
          <Logo size="default" />
        ) : (
          <div className="flex justify-center">
            <Logo size="small" />
          </div>
        )}
      </div>
      
      {/* User Info */}
      {userName && (
        <div className="p-4 border-b">
          {isOpen ? (
            <div>
              <p className="font-semibold">{userName}</p>
              <p className="text-sm text-gray-600">{userRole}</p>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {userName.charAt(0)}
            </div>
          )}
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-grow overflow-y-auto py-4">
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path} 
                className={`flex items-center px-4 py-3 hover:bg-gray-100 transition-colors ${
                  activePath === item.path ? 'bg-gray-100 border-l-4 border-primary' : ''
                }`}
              >
                {item.icon && (
                  <div className="w-6 h-6 mr-3">
                    {item.icon}
                  </div>
                )}
                {isOpen && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Toggle Button */}
      <div className="p-4 border-t">
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-md"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;