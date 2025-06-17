import React, { useState, useEffect } from 'react';
import GroupInvitation from './GroupInvitation';

/**
 * Component quản lý thông báo và lời mời nhóm
 * Hiển thị các lời mời tham gia nhóm và các thông báo khác
 */
const NotificationManager = () => {
  const [invitations, setInvitations] = useState([]);
  const [currentInvitation, setCurrentInvitation] = useState(null);

  // Giả định dữ liệu - trong thực tế sẽ fetch từ API
  useEffect(() => {
    // Lấy danh sách các nhóm người dùng đã rời
    const leftGroups = JSON.parse(localStorage.getItem('leftGroups') || '[]');
    
    // Mô phỏng việc nhận lời mời từ server
    // Trong thực tế, có thể sử dụng WebSocket hoặc polling để cập nhật
    const mockInvitations = [
      {
        id: 'inv-1',
        type: 'group-invitation',
        groupId: '1',
        groupName: 'Nhóm 1',
        inviterId: 'user-123',
        inviterName: 'Nguyễn Văn A',
        timestamp: new Date().toISOString()
      },
      // Có thể thêm nhiều lời mời khác ở đây
    ];
    
    // Lọc ra chỉ những lời mời cho các nhóm mà người dùng đã rời
    const filteredInvitations = mockInvitations.filter(invitation => 
      leftGroups.includes(invitation.groupId)
    );
    
    setInvitations(filteredInvitations);
    
    // Nếu có lời mời hợp lệ, hiển thị lời mời đầu tiên
    if (filteredInvitations.length > 0) {
      setCurrentInvitation(filteredInvitations[0]);
    }
    
    // Trong thực tế, có thể thiết lập một WebSocket hoặc interval để kiểm tra lời mời mới
  }, []);

  // Xử lý khi đóng lời mời hiện tại
  const handleCloseInvitation = () => {
    // Xóa lời mời hiện tại khỏi danh sách
    setInvitations(invitations.filter(inv => inv.id !== currentInvitation.id));
    
    // Chuyển sang lời mời tiếp theo nếu có
    if (invitations.length > 1) {
      setCurrentInvitation(invitations[1]);
    } else {
      setCurrentInvitation(null);
    }
  };

  // Nếu không có lời mời nào, không hiển thị gì
  if (!currentInvitation) return null;

  // Hiển thị lời mời phù hợp với loại
  if (currentInvitation.type === 'group-invitation') {
    return (
      <GroupInvitation 
        invitationId={currentInvitation.id}
        groupName={currentInvitation.groupName}
        inviterName={currentInvitation.inviterName}
        onClose={handleCloseInvitation}
      />
    );
  }

  // Mặc định không hiển thị gì
  return null;
};

export default NotificationManager;
