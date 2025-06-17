import React from 'react';

/**
 * Layout cho trang quản lý nhóm dành cho nhóm trưởng
 * Hiển thị các nút chức năng bên phải và phần nội dung chính bên trái
 */
const LeaderLayout = ({ children, rightButtons, activePage }) => {
  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* Phần nội dung chính */}
      <div className="flex-1 p-4 min-h-0">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
      
      {/* Các nút chức năng bên phải */}
      <div className="w-full md:w-64 py-4 px-3 bg-purple-50 flex flex-col gap-2.5">
        {rightButtons.map((button, index) => {
          const isActive = activePage === button.label;
          return (
            <button
              key={index}
              onClick={button.onClick}
              className={`w-full text-center py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium shadow-sm transform hover:scale-105 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg' 
                  : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              {button.label}
            </button>
          );
        })}
      </div>
    </div>  );
};

export default LeaderLayout;