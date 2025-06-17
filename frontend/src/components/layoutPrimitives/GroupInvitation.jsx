import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acceptInvitation } from '../../services/groupService';

/**
 * Component hiển thị lời mời tham gia lại nhóm
 * Được sử dụng khi một người dùng đã rời nhóm và được mời lại
 * 
 * @param {string} invitationId - ID của lời mời
 * @param {string} groupName - Tên nhóm
 * @param {string} inviterName - Tên người mời
 * @param {function} onClose - Hàm được gọi khi đóng thông báo
 */
const GroupInvitation = ({ invitationId, groupName, inviterName, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Xử lý khi người dùng chấp nhận lời mời
  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await acceptInvitation(invitationId);
      if (response.success) {
        // Chuyển hướng đến trang nhóm
        navigate(`/groups/${response.groupId}/member/event-viewer`);
      } else {
        alert('Không thể tham gia nhóm: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi xử lý lời mời:', error);
      alert('Có lỗi xảy ra khi tham gia nhóm');
    } finally {
      setLoading(false);
      if (onClose) onClose();
    }
  };

  // Xử lý khi người dùng từ chối lời mời
  const handleReject = () => {
    // Có thể thêm logic từ chối lời mời ở đây nếu cần
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-lg w-80 overflow-hidden p-6">
        <h2 className="text-lg font-semibold text-center mb-4">Lời mời tham gia lại nhóm</h2>
        
        <div className="text-center mb-6">
          <p className="mb-2">
            <span className="font-medium">{inviterName}</span> đã mời bạn tham gia lại nhóm:
          </p>
          <p className="text-lg font-semibold">{groupName}</p>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="px-6 py-2 bg-purple-400 text-black rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đồng ý'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInvitation;
