import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import APerson from '../../assets/images/APerson.png';
import MultiPeople from '../../assets/images/MultiPeople.png';
import OutGroupIcon from '../../assets/images/OutGroup.png';
import OutGroup from './GroupSettingButton/OutGroup';
import MemberListLeader from './GroupSettingButton/MemberList/MemberListLeader';
import MemberListView from './GroupSettingButton/MemberList/MemberListView';
import GroupInformationEdit from './GroupSettingButton/GroupInformationEdit';
import AddNewMember from './GroupSettingButton/AddNewMember';
import { leaveGroup } from '../../services/groupService';
import { triggerGroupMemberChange } from '../../utils/groupUtils';

/**
 * Component hiển thị cửa sổ cài đặt nhóm
 */
const GroupSetting = ({ 
  isOpen, 
  onClose, 
  groupName = "Nhóm 1", 
  groupId, 
  isLeader = false,
  onEditInfo,
  onAddMember,
  onMemberList,
  onLeaveGroup
}) => {
  const navigate = useNavigate();
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [showEditInfo, setShowEditInfo] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const memberListButtonRef = useRef(null);

  // Lấy chữ cái đầu tiên của tên nhóm để làm avatar - giống như trong GroupHeader
  const getGroupAvatar = (name) => {
    if (!name || name.trim() === '') return 'N';
    return name.charAt(0).toUpperCase();
  };

  // Reset states when settings popup is opened
  useEffect(() => {
    if (isOpen) {
      setShowMemberList(false);
      setShowEditInfo(false);
      setShowAddMember(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle click outside the popup
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      if (showMemberList) {
        setShowMemberList(false);
      } else if (showEditInfo) {
        setShowEditInfo(false);
      } else if (showAddMember) {
        setShowAddMember(false);
      } else {
        onClose();
      }
    }
  };

  // Xử lý khi nhấn vào nút chỉnh sửa thông tin (leader) hoặc xem thông tin (member)
  const handleEditInfo = () => {
    setShowEditInfo(true);
  };

  // Xử lý khi nhấn vào tùy chọn thêm thành viên
  const handleAddMember = () => {
    setShowAddMember(true);
  };

  // Xử lý khi nhấn vào tùy chọn xem danh sách thành viên
  const handleMemberList = () => {
    if (isLeader) {
      setShowMemberList(true);
    } else {
      setShowMemberList(true);
    }
  };

  // Xử lý khi nhấn vào tùy chọn rời nhóm
  const handleLeaveGroup = () => {
    setShowLeaveConfirmation(true);
  };

  const handleConfirmLeave = async (confirmed) => {
    if (confirmed) {
      try {
        const response = await leaveGroup(groupId);
        if (response.success) {
          // Trigger event để các component khác biết có thay đổi thành viên
          triggerGroupMemberChange(groupId, 'leave');
          navigate('/groups');
        } else {
          console.error('Lỗi khi rời nhóm:', response.message);
          
          // Hiển thị thông báo lỗi cụ thể dựa trên mã lỗi
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
        alert('Có lỗi xảy ra khi rời nhóm.');
      }
    }
    setShowLeaveConfirmation(false);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-end p-4 z-40"
        onClick={handleOutsideClick}
      >
        <div className="bg-gray-100 rounded-lg shadow-xl w-72 overflow-hidden z-40">
          {/* Phần trên: Ảnh đại diện và tên nhóm */}
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center mb-2 shadow-md">
              <span className="text-2xl font-bold">
                {getGroupAvatar(groupName)}
              </span>
            </div>
            <h3 className="text-center font-medium">{groupName}</h3>
            
            {/* Nút chỉnh sửa thông tin (leader) hoặc xem thông tin (member) */}
            <button 
              className="mt-3 bg-purple-400 text-black py-2 px-6 rounded-full hover:bg-purple-500 transition-colors"
              onClick={handleEditInfo}
            >
              {isLeader ? 'Chỉnh sửa thông tin' : 'Xem thông tin nhóm'}
            </button>
          </div>
          
          {/* Phần dưới: Menu tùy chọn */}
          <div className="bg-white p-4 rounded-lg">
            <ul className="space-y-4">
              {/* Tùy chọn mời thành viên - cả leader và member đều có thể mời */}
              <li>
                <button 
                  className="w-full flex items-center py-2 hover:bg-gray-50 transition-colors"
                  onClick={handleAddMember}
                >
                  <div className="flex items-center justify-center w-10 h-10">
                    <img src={APerson} alt="Add member" className="w-6 h-6" />
                  </div>
                  <span className="ml-2">{isLeader ? 'Thêm thành viên' : 'Mời thành viên'}</span>
                </button>
              </li>
              
              {/* Tùy chọn xem danh sách thành viên */}
              <li>
                <button
                  ref={memberListButtonRef}
                  className="w-full flex items-center py-2 hover:bg-gray-50 transition-colors"
                  onClick={handleMemberList}  
                >
                  <div className="flex items-center justify-center w-10 h-10">
                    <img src={MultiPeople} alt="Member list" className="w-6 h-6" />
                  </div>
                  <span className="ml-2">Danh sách thành viên</span>
                </button>
              </li>
              
              {/* Tùy chọn rời nhóm - hiển thị cho cả leader và member */}
              <li>
                <button 
                  className="w-full flex items-center py-2 hover:bg-gray-50 transition-colors"
                  onClick={handleLeaveGroup}
                >
                  <div className="flex items-center justify-center w-10 h-10">
                    <img src={OutGroupIcon} alt="Leave group" className="w-6 h-6" />
                  </div>
                  <span className="ml-2">Rời Nhóm</span>              
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* OutGroup component for leave confirmation */}
      <OutGroup 
        isOpen={showLeaveConfirmation}
        onClose={() => setShowLeaveConfirmation(false)}
        onConfirm={handleConfirmLeave}
        groupId={groupId}
        isLeader={isLeader}
      />

      {/* Danh sách thành viên */}
      {showMemberList && (
        isLeader ? (
          <MemberListLeader
            isOpen={true}
            onClose={() => setShowMemberList(false)}
            anchorRef={memberListButtonRef}
            className="absolute"
            groupId={groupId}
          />
        ) : (
          <MemberListView
            isOpen={true}
            onClose={() => setShowMemberList(false)}
            anchorRef={memberListButtonRef}
            className="absolute"
            groupId={groupId}
          />
        )
      )}

      {/* Chỉnh sửa thông tin nhóm */}
      <GroupInformationEdit
        isOpen={showEditInfo}
        onClose={() => setShowEditInfo(false)}
        groupId={groupId}
        isLeader={isLeader}
      />

      {/* Thêm thành viên */}
      <AddNewMember
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        groupId={groupId}
        isLeader={isLeader}
      />
    </>
  );
};

export default GroupSetting;