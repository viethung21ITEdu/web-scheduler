import React from 'react';

/**
 * Component hiển thị thông tin chi tiết của yêu cầu vào nhóm
 */
const RequestInfo = ({ request, isVisible, position, onAccept, onDeny }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute bg-white rounded-lg shadow-lg p-4 z-50 w-72"
      style={{
        top: position.y,
        left: position.x
      }}
    >
      <div className="flex flex-col">
        {/* Avatar và thông tin */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-lg">
            {request.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <h3 className="font-medium">{request.name}</h3>
            <p className="text-sm text-gray-600">Email: {request.email}</p>
          </div>
        </div>

        {/* Các nút hành động */}
        <div className="flex space-x-2">
          <button
            onClick={onAccept}
            className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
          >
            Đồng ý
          </button>
          <button
            onClick={onDeny}
            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestInfo;
