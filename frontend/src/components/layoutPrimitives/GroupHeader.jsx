import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupSetting from './GroupSetting';
import { getGroupById } from '../../services/groupService';

/**
 * Header cho trang quản lý sự kiện nhóm
 * Hiển thị tên nhóm, số thành viên và các nút chức năng
 * Tích hợp sẵn cửa sổ cài đặt nhóm khi nhấn vào nút Cài đặt
 * 
 * @param {string} groupName - Tên nhóm sẽ hiển thị
 * @param {number} memberCount - Số thành viên trong nhóm
 * @param {function} onSettings - Hàm được gọi khi nhấn nút Cài đặt (tùy chọn)
 * @param {function} onBack - Hàm được gọi khi nhấn nút Trở về (tùy chọn)
 * @param {boolean} showBackToGroups - Nếu true sẽ luôn trở về trang danh sách nhóm, nếu false sẽ sử dụng onBack
 * @param {string} backTarget - URL đích khi nhấn nút Trở về (mặc định là '/groups')
 * @param {string} groupId - ID của nhóm (được lấy từ URL params nếu không cung cấp)
 * @param {boolean} isLeader - Xác định người dùng hiện tại có phải là trưởng nhóm hay không
 * @param {string} description - Mô tả của nhóm
 */
const GroupHeader = ({ 
  groupName = "Nhóm", 
  memberCount = 0, 
  onSettings, 
  onBack, 
  showBackToGroups = false,
  backTarget = '/groups',
  groupId: propGroupId,
  isLeader = false,
  description = ""
}) => {
  const navigate = useNavigate();
  const params = useParams();
  
  // Lấy groupId từ URL params nếu không được truyền vào
  const groupId = propGroupId || params.groupId;
  
  // State để quản lý hiển thị cửa sổ cài đặt
  const [showSettings, setShowSettings] = useState(false);
  
  // State để lưu thông tin nhóm
  const [groupInfo, setGroupInfo] = useState({
    name: groupName,
    memberCount: memberCount,
    description: description
  });

  // Lấy thông tin nhóm nếu chưa có description
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!description && groupId) {
        try {
          const response = await getGroupById(groupId);
          if (response.success && response.data) {
            setGroupInfo(prev => ({
              ...prev,
              description: response.data.description || ""
            }));
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin nhóm:', error);
        }
      }
    };
    
    fetchGroupData();
  }, [groupId, description]);

  // Xử lý nút trở về - ưu tiên quay lại danh sách nhóm nếu showBackToGroups=true
  const handleBackNavigation = () => {
    if (showBackToGroups) {
      navigate(backTarget);
    } else if (onBack) {
      onBack();
    } else {
      navigate(backTarget);
    }
  };

  // Xử lý khi nhấn nút cài đặt
  const handleSettingsClick = () => {
    // Nếu có callback onSettings thì gọi nó và không mở cửa sổ cài đặt
    if (onSettings) {
      onSettings();
    } else {
      // Nếu không có callback, hiển thị cửa sổ cài đặt mặc định
      setShowSettings(true);
    }
  };
  
  // Xử lý khi đóng cửa sổ cài đặt
  const handleCloseSettings = () => {
    setShowSettings(false);
  };
  
  // Lấy chữ cái đầu tiên của tên nhóm để làm avatar
  const getGroupAvatar = (name) => {
    if (!name || name.trim() === '') return 'N';
    return name.charAt(0).toUpperCase();
  };

  // Xử lý hiển thị mô tả ngắn gọn
  const getShortDescription = (desc) => {
    if (!desc) return "";
    return desc.length > 60 ? desc.substring(0, 60) + '...' : desc;
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 border-b">
      {/* Phần trái: Avatar và thông tin nhóm */}
      <div className="flex items-center">
        {/* Avatar nhóm */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center mr-3 shadow-md">
          <span className="text-lg font-bold">
            {getGroupAvatar(groupName)}
          </span>
        </div>
        
        {/* Thông tin nhóm */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800 text-lg leading-tight">
              {groupName}
            </h2>
            
            {/* Mô tả nhóm */}
            {(groupInfo.description || description) && (
              <span className="text-sm text-gray-600 line-clamp-1 hidden sm:inline">
                - {getShortDescription(groupInfo.description || description)}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a6.926 6.926 0 00-1.5-.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
            <span>{memberCount} thành viên</span>
            
            {/* Hiển thị mô tả trên mobile */}
            {(groupInfo.description || description) && (
              <span className="text-sm text-gray-600 line-clamp-1 ml-2 sm:hidden">
                - {getShortDescription(groupInfo.description || description)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Phần phải: Các nút */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleSettingsClick}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors font-medium"
        >
          Cài đặt
        </button>
        <button 
          onClick={handleBackNavigation}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors font-medium"
        >
          Trở về
        </button>
      </div>

      {/* Cửa sổ cài đặt nhóm */}
      <GroupSetting
        isOpen={showSettings}
        onClose={handleCloseSettings}
        groupName={groupName}
        groupId={groupId}
        isLeader={isLeader}
      />
    </div>
  );
};

export default GroupHeader;