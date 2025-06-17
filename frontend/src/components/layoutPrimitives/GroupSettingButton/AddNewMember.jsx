import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateInviteLink, sendEmailInvite } from '../../../services/groupService';

/**
 * Component hiển thị cửa sổ mời thành viên mới
 * - Member: có thể mời thành viên (cần leader duyệt)
 * - Leader: có thể thêm thành viên trực tiếp
 * Cho phép tạo và sao chép link mời thành viên hoặc gửi lời mời qua email
 * 
 * @param {boolean} isOpen - Trạng thái hiển thị của cửa sổ
 * @param {function} onClose - Hàm được gọi khi đóng cửa sổ
 * @param {string} groupId - ID của nhóm
 * @param {boolean} isLeader - Người dùng có phải leader không
 */
const AddNewMember = ({ isOpen, onClose, groupId, isLeader = false }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  
  // Tạo link mời khi component được mở
  useEffect(() => {
    if (isOpen && groupId) {
      generateLink();
    }
  }, [isOpen, groupId]);

  // Debug
  console.log('AddNewMember render:', { isOpen, groupId, isLeader });
  
  // Nếu cửa sổ không được mở thì không hiển thị gì
  if (!isOpen) return null;



  // Tạo link mời
  const generateLink = async () => {
    setLoading(true);
    try {
      const response = await generateInviteLink(groupId);
      if (response.success) {
        setInviteLink(response.data.invite_code);
      } else {
        alert('Không thể tạo link mời: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi tạo link:', error);
      alert('Có lỗi xảy ra khi tạo link mời');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi click ra ngoài cửa sổ
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Xử lý khi copy link vào clipboard
  const handleCopyLink = () => {
    if (!inviteLink) {
      alert('Link chưa được tạo!');
      return;
    }
    
    // Tạo URL đầy đủ
    const fullUrl = `${window.location.origin}/join/${inviteLink}`;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
      if (isLeader) {
        alert('Đã sao chép link vào clipboard!');
      } else {
        alert('Đã sao chép link vào clipboard! Lưu ý: Người tham gia qua link này sẽ cần được nhóm trưởng duyệt.');
      }
    }, (err) => {
      console.error('Không thể sao chép: ', err);
      alert('Không thể sao chép link');
    });
  };

  // Xử lý khi gửi lời mời qua email
  const handleSendInvite = async () => {
    if (!email || !email.includes('@')) {
      alert('Vui lòng nhập một địa chỉ email hợp lệ!');
      return;
    }
    
    setEmailLoading(true);
    try {
      const response = await sendEmailInvite(groupId, email);
      if (response.success) {
        if (isLeader) {
          alert(response.message);
        } else {
          alert(`Đã gửi lời mời đến ${email}. Người được mời sẽ cần được nhóm trưởng duyệt sau khi họ nhấn vào link.`);
        }
        setEmail('');
      } else {
        alert('Không thể gửi lời mời: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      alert('Có lỗi xảy ra khi gửi lời mời');
    } finally {
      setEmailLoading(false);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-[500px] overflow-hidden p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isLeader ? 'Thêm thành viên' : 'Mời thành viên'}
        </h2>
        
        {/* Thông báo cho member */}
        {!isLeader && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Lưu ý:</strong> Lời mời của bạn sẽ cần được nhóm trưởng duyệt trước khi thành viên có thể tham gia nhóm.
            </p>
          </div>
        )}
        
        {/* Phần tạo link mời */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link nhóm
          </label>
          <div className="flex">
            <input
              type="text"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md bg-gray-200 text-gray-600"
              value={loading ? 'Đang tạo link...' : (inviteLink ? `${window.location.origin}/join/${inviteLink}` : '')}
              readOnly
            />
            <button
              onClick={handleCopyLink}
              disabled={loading || !inviteLink}
              className="px-4 py-2 bg-gray-200 border border-gray-300 rounded-r-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Phần gửi lời mời qua email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isLeader ? 'Nhập email người bạn muốn mời' : 'Nhập email người bạn muốn mời (cần duyệt)'}
          </label>
          <div className="flex">
            <input
              type="email"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md bg-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
            />
            <button
              onClick={handleSendInvite}
              disabled={emailLoading}
              className="px-3 py-2 bg-gray-200 border border-gray-300 rounded-r-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? (
                <div className="h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Nút đóng */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-400 text-black rounded-full hover:bg-purple-500 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewMember;