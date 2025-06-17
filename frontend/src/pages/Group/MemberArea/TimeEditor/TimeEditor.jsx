import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupHeader from '../../../../components/layoutPrimitives/GroupHeader';
import MemberLayout from '../../../../components/layoutPrimitives/MemberLayout';
import TimeManager from '../../../../components/groupWidgets/TimeManager/TimeManager';
import { getGroupById } from '../../../../services/groupService';

/**
 * Component cho phép thành viên cập nhật thời gian rảnh
 */
const TimeEditor = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  // State để lưu thông tin nhóm
  const [groupInfo, setGroupInfo] = useState({
    name: '',
    memberCount: 0,
    description: ''
  });

  // Lấy thông tin nhóm khi component được mount
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await getGroupById(groupId);
        if (response.success) {
          console.log('Group data received:', response.data);
          setGroupInfo({
            name: response.data.name,
            memberCount: response.data.memberCount || 0,
            description: response.data.description || ''
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin nhóm:', error);
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  // Các nút chức năng bên phải
  const rightButtons = [
    { label: 'Sự kiện', onClick: () => navigate(`/groups/${groupId}/member/event-viewer`) },
    { label: 'Quản lý thời gian', onClick: () => {} },
    { label: 'Quản lý vị trí và sở thích', onClick: () => navigate(`/groups/${groupId}/member/location-preference`) },
    { label: 'Lịch rảnh nhóm', onClick: () => navigate(`/groups/${groupId}/member/group-calendar`) },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <GroupHeader 
        groupName={groupInfo.name || 'Đang tải...'}
        memberCount={groupInfo.memberCount || 0}
        showBackToGroups={true}
        isLeader={false}
        groupId={groupId}
        description={groupInfo.description}
      />
      
      {/* Main Content */}
      <MemberLayout rightButtons={rightButtons} activePage="Quản lý thời gian">
        <TimeManager userRole="member" groupId={groupId} />
      </MemberLayout>
    </div>
  );
};

export default TimeEditor;
