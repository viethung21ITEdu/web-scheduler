import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupHeader from '../../../../components/layoutPrimitives/GroupHeader';
import MemberLayout from '../../../../components/layoutPrimitives/MemberLayout';
import Event from '../../../../components/groupWidgets/EventManager/Event';
import { Dialog } from '../../../../components/common/Dialog';
import { getGroupById, confirmEventParticipation } from '../../../../services/groupService';
import { getEventsByGroupId } from '../../../../services/eventService';
import bookingService from '../../../../services/bookingService';

/**
 * Component hiển thị thông tin sự kiện dành cho thành viên nhóm
 * Cho phép thành viên xem thông tin sự kiện đã được tạo
 */
const EventViewer = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State để lưu thông tin nhóm
  const [groupInfo, setGroupInfo] = useState({
    name: '',
    memberCount: 0
  });

  // State để lưu thông tin events
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);

  // Lấy thông tin nhóm và events khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin nhóm
        const groupResponse = await getGroupById(groupId);
        console.log('🔍 Group response:', groupResponse);
        if (groupResponse.success) {
          setGroupInfo({
            name: groupResponse.data.name,
            memberCount: groupResponse.data.memberCount
          });
        } else {
          console.error('Lỗi khi lấy thông tin nhóm:', groupResponse.message);
        }

        // Lấy danh sách events của nhóm
        const eventsResponse = await getEventsByGroupId(groupId);
        console.log('🎉 Events response:', eventsResponse);
        if (eventsResponse.success) {
          setEvents(eventsResponse.data);
          console.log('📅 Events data:', eventsResponse.data);
          // Hiển thị event đầu tiên (mới nhất)
          if (eventsResponse.data.length > 0) {
            const latestEvent = eventsResponse.data[0];
            console.log('⭐ Latest event:', latestEvent);
            console.log('🎯 Member view - Match rate from database:', latestEvent.match_rate);
            setCurrentEventId(latestEvent.event_id); // Lưu event ID
            
            // Kiểm tra trạng thái đặt chỗ từ database
            let bookingStatus = 'Chưa đặt';
            try {
              const bookingsResponse = await bookingService.getEventBookings(latestEvent.event_id);
              if (bookingsResponse && bookingsResponse.length > 0) {
                const confirmedBooking = bookingsResponse.find(booking => booking.status === 'confirmed');
                if (confirmedBooking) {
                  bookingStatus = 'Đã đặt';
                }
              }
            } catch (error) {
              console.log('⚠️ Không thể lấy thông tin đặt chỗ:', error);
            }
            
            setCurrentEvent({
              name: latestEvent.name || 'Chưa có tên',
              location: latestEvent.venue || 'Chưa có địa điểm',
              time: latestEvent.start_time ? 
                new Date(latestEvent.start_time).toLocaleString('vi-VN') : 
                'Chưa có thời gian',
              locationType: 'Đã xác định',
              matchRate: latestEvent.match_rate ? `${latestEvent.match_rate}%` : '0%',
              bookingStatus: bookingStatus,
              notificationStatus: latestEvent.notification_status === 'sent' ? 'Đã thông báo' : 'Chưa thông báo',
              attendeeCount: Math.max(latestEvent.participant_count || 0, 1)
            });
          } else {
            console.log('⚠️ Không có events nào trong nhóm');
          }
        } else {
          console.error('Lỗi khi lấy danh sách sự kiện:', eventsResponse.message);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);
  
  // Các hàm xử lý sự kiện
  const handleEditTime = () => {
    navigate(`/groups/${groupId}/member/time-editor`);
  };

  const handleEditLocation = () => {
    navigate(`/groups/${groupId}/member/location-preference`);
  };

  const handleViewGroupCalendar = () => {
    navigate(`/groups/${groupId}/member/group-calendar`);
  };

  const handleConfirmParticipation = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      const response = await confirmEventParticipation(groupId, currentEventId);
      if (response.success) {
        // Cập nhật attendeeCount với số chính xác từ backend
        if (currentEvent && response.data?.participantCount !== undefined) {
          setCurrentEvent(prev => ({
            ...prev,
            attendeeCount: response.data.participantCount
          }));
        }
        setShowConfirmDialog(false);
        
        // Hiển thị thông báo khác nhau tùy vào trạng thái
        if (response.data?.alreadyParticipating) {
          alert('Bạn đã tham gia sự kiện này rồi!');
        } else {
          alert('Đã xác nhận tham gia sự kiện thành công!');
        }
      } else {
        alert('Không thể xác nhận tham gia: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi xác nhận tham gia:', error);
      alert('Có lỗi xảy ra khi xác nhận tham gia.');
    } finally {
      setConfirmLoading(false);
    }
  };
  
  // Các nút chức năng bên phải
  const rightButtons = [
    { label: 'Xem sự kiện', onClick: () => {} }, // Không cần hành động vì đang ở trang xem sự kiện
    { label: 'Chỉnh sửa thời gian', onClick: handleEditTime },
    { label: 'Chỉnh sửa vị trí và sở thích', onClick: handleEditLocation },
    { label: 'Xem lịch rảnh chung của cả nhóm', onClick: handleViewGroupCalendar },
  ];

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <GroupHeader 
          groupName="Đang tải..."
          memberCount={0}
          showBackToGroups={true}
          isLeader={false}
          groupId={groupId}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">Đang tải thông tin sự kiện...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <GroupHeader 
        groupName={groupInfo.name || 'Đang tải...'}
        memberCount={groupInfo.memberCount || 0}
        showBackToGroups={true}
        isLeader={false}
        groupId={groupId}
      />
      
      {/* Main Content */}
      <MemberLayout rightButtons={rightButtons} activePage="Xem sự kiện">
        {events.length === 0 ? (
          <div className="bg-white rounded-md shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Chưa có sự kiện</h2>
            <p className="text-gray-600">
              Nhóm này chưa có sự kiện nào được tạo. 
              Vui lòng liên hệ với trưởng nhóm để tạo sự kiện mới.
            </p>
          </div>
        ) : (
          <Event
            variant="member"
            eventDetails={currentEvent}
            onConfirmParticipation={handleConfirmParticipation}
          />
        )}
        
        <Dialog
          isOpen={showConfirmDialog}
          onClose={() => !confirmLoading && setShowConfirmDialog(false)}
          onConfirm={handleConfirm}
          title="Xác nhận tham gia"
          message="Bạn có chắc chắn muốn tham gia sự kiện này?"
          confirmText={confirmLoading ? "Đang xác nhận..." : "Xác nhận"}
          type="confirm"
        />
      </MemberLayout>
    </div>
  );
};

export default EventViewer;
