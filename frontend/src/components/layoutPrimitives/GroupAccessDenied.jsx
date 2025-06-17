import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component hiển thị thông báo từ chối truy cập vào nhóm
 * Hiển thị khi người dùng cố gắng truy cập nhóm mà họ đã rời
 * 
 * @param {string} groupId - ID của nhóm
 */
const GroupAccessDenied = ({ groupId }) => {
  const navigate = useNavigate();

  // Xử lý khi người dùng nhấn nút trở về trang danh sách nhóm
  const handleBackToGroups = () => {
    navigate('/groups');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold mb-2">Không thể truy cập</h2>
        
        <p className="text-gray-600 mb-6">
          Bạn đã rời khỏi nhóm này và không thể truy cập nếu không được mời lại. Vui lòng liên hệ với trưởng nhóm để được mời lại.
        </p>
        
        <button
          onClick={handleBackToGroups}
          className="px-6 py-2 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600 transition-colors"
        >
          Quay lại danh sách nhóm
        </button>
      </div>
    </div>
  );
};

export default GroupAccessDenied;
