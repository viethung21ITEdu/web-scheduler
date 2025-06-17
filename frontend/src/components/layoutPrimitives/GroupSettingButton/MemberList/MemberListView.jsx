import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MemberInfor from '../../MemberInfor';
import Scrollbar from '../../../common/Scrollbar';
import { getGroupMembers } from '../../../../services/groupService';

/**
 * Component hiển thị danh sách thành viên cho member
 */
const MemberListView = ({
  isOpen,
  onClose,
  anchorRef,
  groupId,
  className = ''
}) => {
  const popupRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load danh sách thành viên khi popup mở
  useEffect(() => {
    if (isOpen && groupId) {
      loadMembers();
    }
  }, [isOpen, groupId]);

  // Tính toán vị trí popup dựa vào vị trí của nút kích hoạt
  useEffect(() => {
    if (isOpen && anchorRef.current && popupRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const popupEl = popupRef.current;

      // Đặt popup bên phải của nút
      popupEl.style.position = 'absolute';
      popupEl.style.top = `${anchorRect.top}px`;
      popupEl.style.left = `${anchorRect.right + 10}px`; // Cách 10px
      
      // Đảm bảo popup không vượt ra khỏi màn hình
      const rightEdge = anchorRect.right + 10 + popupEl.offsetWidth;
      if (rightEdge > window.innerWidth) {
        // Nếu vượt ra ngoài phía bên phải, đặt bên trái của nút
        popupEl.style.left = `${anchorRect.left - popupEl.offsetWidth - 10}px`;
      }
    }
  }, [isOpen, anchorRef]);

  // Load danh sách thành viên
  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await getGroupMembers(groupId);
      if (response.success) {
        const membersList = response.data.map(member => ({
          id: member.user_id,
          name: member.full_name || member.username,
          email: member.email,
          role: member.role_in_group === 'Leader' ? 'Trưởng nhóm' : 'Thành viên'
        }));
        setMembers(membersList);
      } else {
        console.error('Lỗi khi tải danh sách thành viên:', response.message);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thành viên:', error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi click vào tên thành viên
  const handleMemberClick = (member, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const elementHeight = rect.height;
    setSelectedMember(member);
    setPopupPosition({
      x: rect.left - 290,
      y: rect.top - (elementHeight / 3)
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay để đóng popup khi click ngoài */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => {
          setSelectedMember(null);
          onClose();
        }}
      />

      {/* Popup content */}
      <div
        ref={popupRef}
        className={`w-72 bg-white rounded-lg shadow-xl z-50 ${className}`}
      >
        {/* Danh sách thành viên trong nhóm */}
        <div>
          <h3 className="px-4 py-3 text-sm font-semibold">Thành viên trong nhóm</h3>
          <Scrollbar height="300px" className="border-t border-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="h-6 w-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
              </div>
            ) : members.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Không có thành viên nào
              </div>
            ) : (
              members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={(e) => handleMemberClick(member, e)}
                >
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white mr-3">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                  </div>
                </div>
              ))
            )}
          </Scrollbar>
        </div>
      </div>

      {/* Member Info Popup */}
      <MemberInfor 
        member={selectedMember}
        isVisible={selectedMember !== null}
        position={popupPosition}
      />
    </>
  );
};

export default MemberListView;
