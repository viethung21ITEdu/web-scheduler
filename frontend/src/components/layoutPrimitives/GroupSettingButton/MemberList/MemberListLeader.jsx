import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MemberInfor from '../../MemberInfor';
import RequestInfo from './RequestInfo';
import Scrollbar from '../../../common/Scrollbar';
import { getGroupMembers, getJoinRequests, approveJoinRequest, rejectJoinRequest, removeMember } from '../../../../services/groupService';

/**
 * Hiển thị danh sách thành viên và yêu cầu vào nhóm cho trưởng nhóm
 * @param {Object} props - Props của component
 * @param {boolean} props.isOpen - Trạng thái hiển thị popup
 * @param {Function} props.onClose - Hàm xử lý khi đóng popup
 * @param {Element} props.anchorRef - Tham chiếu đến element kích hoạt popup
 * @param {Array} props.members - Danh sách thành viên trong nhóm
 * @param {Array} props.requests - Danh sách yêu cầu vào nhóm
 * @param {string} props.className - Lớp CSS tùy chọn
 */
const MemberListLeader = ({
  isOpen,
  onClose,
  anchorRef,
  className = ''
}) => {
  const { groupId } = useParams();
  const popupRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [membersList, setMembersList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tải dữ liệu khi mở popup
  useEffect(() => {
    if (isOpen && groupId) {
      loadData();
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

  // Tải danh sách thành viên và yêu cầu
  const loadData = async () => {
    setLoading(true);
    try {
      // Tải danh sách thành viên
      const membersResponse = await getGroupMembers(groupId);
      if (membersResponse.success) {
        setMembersList(membersResponse.data.map(member => ({
          id: member.user_id,
          name: member.full_name || member.username,
          email: member.email,
          role: member.role_in_group === 'Leader' ? 'Trưởng nhóm' : 'Thành viên'
        })));
      }

      // Tải danh sách yêu cầu tham gia
      const requestsResponse = await getJoinRequests(groupId);
      if (requestsResponse.success) {
        setRequestsList(requestsResponse.data.map(request => ({
          id: request.request_id,
          user_id: request.user_id,
          name: request.full_name || request.username,
          email: request.email,
          created_at: request.created_at,
          invite_type: request.invite_type
        })));
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
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
      x: rect.left - 290, // Hiển thị popup bên trái của tên thành viên (280px width + 10px spacing)
      y: rect.top - (elementHeight / 3) // Căn giữa theo chiều dọc với tên thành viên
    });
  };

  // Xử lý khi click vào yêu cầu tham gia
  const handleRequestClick = (request, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const elementHeight = rect.height;
    setSelectedRequest(request);
    setPopupPosition({
      x: rect.left - 290,
      y: rect.top - (elementHeight / 3)
    });
  };

  // Xử lý khi đồng ý yêu cầu tham gia
  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await approveJoinRequest(groupId, selectedRequest.id);
      if (response.success) {
        // Thêm người dùng vào danh sách thành viên
        const newMember = {
          id: selectedRequest.user_id,
          name: selectedRequest.name,
          email: selectedRequest.email,
          role: 'Thành viên'
        };
        
        setMembersList(prev => [...prev, newMember]);
        
        // Xóa khỏi danh sách yêu cầu
        setRequestsList(prev => prev.filter(req => req.id !== selectedRequest.id));
        
        alert('Đã duyệt yêu cầu tham gia nhóm');
      } else {
        alert('Không thể duyệt yêu cầu: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi duyệt yêu cầu:', error);
      alert('Có lỗi xảy ra khi duyệt yêu cầu');
    } finally {
      // Đóng popup thông tin
      setSelectedRequest(null);
    }
  };

  // Xử lý khi từ chối yêu cầu tham gia
  const handleDenyRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await rejectJoinRequest(groupId, selectedRequest.id);
      if (response.success) {
        // Xóa khỏi danh sách yêu cầu
        setRequestsList(prev => prev.filter(req => req.id !== selectedRequest.id));
        
        alert('Đã từ chối yêu cầu tham gia nhóm');
      } else {
        alert('Không thể từ chối yêu cầu: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi từ chối yêu cầu:', error);
      alert('Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      // Đóng popup thông tin
      setSelectedRequest(null);
    }
  };

  // Thêm hàm xử lý xoá thành viên
  const handleRemoveMember = async () => {
    if (!selectedMember) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xoá ${selectedMember.name} khỏi nhóm?`)) return;
    try {
      const response = await removeMember(groupId, selectedMember.id);
      if (response.success) {
        setMembersList(prev => prev.filter(m => m.id !== selectedMember.id));
        alert('Đã xoá thành viên khỏi nhóm');
      } else {
        alert('Không thể xoá thành viên: ' + response.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xoá thành viên');
    } finally {
      setSelectedMember(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay để đóng popup khi click ngoài */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => {
          setSelectedMember(null);
          setSelectedRequest(null);
          onClose();
        }}
      />

      {/* Popup content */}
      <div
        ref={popupRef}
        className={`w-72 bg-white rounded-lg shadow-xl z-50 ${className}`}
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-6 w-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        ) : (
          <>
            {/* Danh sách thành viên trong nhóm */}
            <div>
              <h3 className="px-4 py-3 text-sm font-semibold">
                Thành viên trong nhóm ({membersList.length})
              </h3>
              <Scrollbar height="200px" className="border-t border-gray-200">
                {membersList.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    Chưa có thành viên nào
                  </div>
                ) : (
                  membersList.map(member => (
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

            {/* Danh sách yêu cầu vào nhóm */}
            <div>
              <h3 className="px-4 py-3 text-sm font-semibold">
                Yêu cầu vào nhóm ({requestsList.length})
              </h3>
              <Scrollbar height="150px" className="border-t border-gray-200">
                {requestsList.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    Không có yêu cầu nào
                  </div>
                ) : (
                  requestsList.map(request => (
                    <div
                      key={request.id}
                      className="flex items-center px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                      onClick={(e) => handleRequestClick(request, e)}
                    >
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white mr-3">
                        {request.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{request.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Scrollbar>
            </div>
          </>
        )}
      </div>

      {/* Request Info Popup */}
      <RequestInfo
        request={selectedRequest}
        isVisible={selectedRequest !== null}
        position={popupPosition}
        onAccept={handleAcceptRequest}
        onDeny={handleDenyRequest}
      />

      {/* Popup thông tin thành viên khi click */}
      {selectedMember && (
        <div
          className="fixed z-50 bg-white border rounded shadow-lg p-4"
          style={{ left: popupPosition.x, top: popupPosition.y, width: 260 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="font-semibold mb-1">{selectedMember.name}</div>
          <div className="text-xs text-gray-500 mb-2">{selectedMember.email}</div>
          <div className="text-xs text-gray-500 mb-2">{selectedMember.role}</div>
          {/* Chỉ hiện nút xoá nếu không phải Leader */}
          {selectedMember.role !== 'Trưởng nhóm' && (
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              onClick={handleRemoveMember}
            >
              Xoá khỏi nhóm
            </button>
          )}
          <button
            className="ml-2 px-3 py-1 rounded border text-sm"
            onClick={() => setSelectedMember(null)}
          >
            Đóng
          </button>
        </div>
      )}
    </>
  );
};

export default MemberListLeader;