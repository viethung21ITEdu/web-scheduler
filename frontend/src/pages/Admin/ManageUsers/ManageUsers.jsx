import React, { useState } from 'react';
import AddUsers from './AddUsers';
import DeleteUsers from './DeleteUsers';
import { HiUserAdd, HiUserRemove } from 'react-icons/hi';

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState('add');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddUsers />;
      case 'remove':
        return <DeleteUsers />;
      default:
        return <AddUsers />;
    }
  };
  
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Header area */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-800">Quản lý người dùng</h1>
        <p className="text-sm text-gray-600">Thêm và quản lý tài khoản người dùng hệ thống</p>
      </div>
      
      {/* Action tabs */}
      <div className="bg-white border-b">
        <div className="flex px-4">
          <button
            className={`py-3 px-4 flex items-center ${
              activeTab === 'add' 
                ? 'border-b-2 border-purple-500 text-purple-600 font-medium' 
                : 'text-gray-600 hover:text-purple-500'
            }`}
            onClick={() => setActiveTab('add')}
          >
            <HiUserAdd className="mr-2" />
            Thêm người dùng
          </button>
          <button
            className={`py-3 px-4 flex items-center ${
              activeTab === 'remove' 
                ? 'border-b-2 border-purple-500 text-purple-600 font-medium' 
                : 'text-gray-600 hover:text-purple-500'
            }`}
            onClick={() => setActiveTab('remove')}
          >
            <HiUserRemove className="mr-2" />
            Xóa người dùng
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ManageUsers;