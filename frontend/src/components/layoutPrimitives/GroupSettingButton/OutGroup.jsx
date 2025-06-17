import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveGroup, getGroupById, getGroupMembers } from '../../../services/groupService';

/**
 * Component hiển thị cửa sổ xác nhận rời nhóm
 * Hiển thị popup xác nhận khi người dùng muốn rời khỏi nhóm
 * 
 * @param {boolean} isOpen - Trạng thái hiển thị của cửa sổ
 * @param {function} onClose - Hàm được gọi khi đóng cửa sổ hoặc hủy rời nhóm
 * @param {function} onConfirm - Hàm được gọi khi người dùng xác nhận muốn rời nhóm
 * @param {string} groupId - ID của nhóm
 * @param {boolean} isLeader - Người dùng có phải leader không
 */
const OutGroup = ({ isOpen, onClose, onConfirm, groupId, isLeader = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [canLeave, setCanLeave] = useState(true);
  
  // Kiểm tra điều kiện rời nhóm khi mở popup
  useEffect(() => {
    if (isOpen && groupId) {
      checkLeaveConditions();
    }
  }, [isOpen, groupId, isLeader]);


  
  // Nếu cửa sổ không được mở thì không hiển thị gì
  if (!isOpen) return null;

  // Kiểm tra điều kiện rời nhóm
  const checkLeaveConditions = async () => {
    try {
      if (isLeader) {
        // Nếu là leader, kiểm tra số thành viên
        const membersResponse = await getGroupMembers(groupId);
        if (membersResponse.success) {
          const nonLeaderMembers = membersResponse.data.filter(member => member.role_in_group !== 'Leader');
          
          if (nonLeaderMembers.length > 0) {
            setWarningMessage('Bạn là nhóm trưởng, không thể rời nhóm khi còn thành viên khác.');
            setCanLeave(false);
            return;
          }
        }
        
        // Kiểm tra sự kiện đang diễn ra (sẽ được xử lý ở backend khi gọi API leaveGroup)
        setWarningMessage('Khi rời nhóm, mọi thông tin của bạn trong nhóm sẽ bị xóa. Bạn có chắc chắn muốn rời nhóm?');
        setCanLeave(true);
      } else {
        setWarningMessage('Khi rời nhóm, mọi thông tin của bạn trong nhóm sẽ bị xóa. Bạn có chắc chắn muốn rời nhóm?');
        setCanLeave(true);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra điều kiện rời nhóm:', error);
      setWarningMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
      setCanLeave(false);
    }
  };

  // Xử lý khi click ra ngoài cửa sổ
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Xử lý khi xác nhận rời nhóm
  const handleConfirm = async () => {
    if (!canLeave) {
      return;
    }

    setLoading(true);
    try {
      const response = await leaveGroup(groupId);
      if (response.success) {
        alert(response.message);
        navigate('/groups');
        onClose();
      } else {
        // Hiển thị thông báo lỗi cụ thể
        let errorMessage = response.message;
        if (response.code === 'LEADER_HAS_MEMBERS') {
          errorMessage = 'Bạn là nhóm trưởng, không thể rời nhóm khi còn thành viên khác.';
        } else if (response.code === 'EVENT_IN_PROGRESS') {
          errorMessage = 'Sự kiện đang diễn ra, không thể rời nhóm.';
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Lỗi khi rời nhóm:', error);
      alert('Có lỗi xảy ra khi rời nhóm');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-96 overflow-hidden p-6">
        <h2 className="text-lg font-semibold text-center mb-4">
          {canLeave ? 'Xác nhận rời nhóm?' : 'Không thể rời nhóm'}
        </h2>
        
        <div className="mb-6 text-center text-gray-700">
          <p>{warningMessage}</p>
        </div>
        
        <div className="mt-6 flex justify-center space-x-4">
          {canLeave && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2 bg-purple-400 text-black rounded-full hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đồng ý'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            {canLeave ? 'Hủy bỏ' : 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutGroup;