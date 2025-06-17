import React from 'react';
import FeedPage from '../Feed'; // Import from index.js

const EnterpriseDashboard = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Header area */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-800">Trang chủ doanh nghiệp</h1>
        <p className="text-sm text-gray-600">Xem bài đăng và cập nhật mới nhất</p>
      </div>
      
      {/* Feed content */}
      <div className="flex-1 p-4">
        <FeedPage />
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
