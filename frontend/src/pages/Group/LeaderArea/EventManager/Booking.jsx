import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import GroupHeader from '../../../../components/layoutPrimitives/GroupHeader';
import LeaderLayout from '../../../../components/layoutPrimitives/LeaderLayout';
import { getGroupById } from '../../../../services/groupService';
import { getEventById } from '../../../../services/eventService';
import bookingService from '../../../../services/bookingService';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUserGroup, HiOutlinePhone, HiOutlineClipboardList, HiOutlineCheckCircle } from 'react-icons/hi';

// Custom styles for animations
const styles = {
  '@keyframes bounceIn': {
    '0%': { transform: 'scale(0.8)', opacity: 0 },
    '70%': { transform: 'scale(1.05)', opacity: 1 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
  '@keyframes progress': {
    '0%': { width: '0%' },
    '100%': { width: '100%' },
  },
};

// Inject CSS animation styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      70% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes progress {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    
    .animate-bounce-in {
      animation: bounceIn 0.5s ease-out forwards;
    }
    
    .animate-progress {
      animation: progress 2s linear forwards;
    }
  `;
  document.head.appendChild(styleSheet);
}

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();
  
  // Lấy thông tin từ navigation state
  const { eventId, enterprise } = location.state || {};
  
  // State để lưu thông tin nhóm và đặt chỗ
  const [groupInfo, setGroupInfo] = useState({
    name: '',
    memberCount: 0,
    eventDetails: {
      name: '',
      location: '',
      time: '',
    }
  });
  
  // State để lưu thông tin sự kiện
  const [eventInfo, setEventInfo] = useState(null);
    // State cho form đặt chỗ
      const [bookingInfo, setBookingInfo] = useState({
    attendeeCount: 1,
    notes: ''
  }); 
  
  // State cho validation
  const [errors, setErrors] = useState({
    attendeeCount: '',
  });
    // State cho trạng thái loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho trạng thái thành công
  const [showSuccess, setShowSuccess] = useState(false);

  // Lấy thông tin nhóm và sự kiện khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin nhóm
        const groupResponse = await getGroupById(groupId);
        if (groupResponse.success) {
          setGroupInfo(groupResponse.data);
        } else {
          console.error('Lỗi khi lấy thông tin nhóm:', groupResponse.message);
          alert('Không thể lấy thông tin nhóm. Vui lòng thử lại sau.');
        }
        
        // Lấy thông tin sự kiện nếu có eventId
        if (eventId) {
          const eventResponse = await getEventById(eventId);
          if (eventResponse.success) {
            setEventInfo(eventResponse.data);
            
            // Tự động set số lượng người tham gia từ sự kiện
            const attendeeCount = Math.max(eventResponse.data.participant_count || eventResponse.data.attendeeCount || 0, 1);
            setBookingInfo(prev => ({
              ...prev,
              attendeeCount: attendeeCount
            }));
            
            console.log('Event info:', eventResponse.data);
            console.log('Participant count from API:', eventResponse.data.participant_count);
            console.log('Auto set attendee count:', attendeeCount);
            console.log('Event timeslots:', eventResponse.data.timeslots);
            console.log('Event start_time:', eventResponse.data.start_time);
          } else {
            console.error('Lỗi khi lấy thông tin sự kiện:', eventResponse.message);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu.');
      }
    };

    fetchData();
  }, [groupId, eventId]);
  // Xử lý validation cho form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!eventId || !enterprise) {
      alert('Thiếu thông tin sự kiện hoặc doanh nghiệp');
      return false;
    }
    
    if (bookingInfo.attendeeCount <= 0) {
      newErrors.attendeeCount = 'Số người tham gia phải lớn hơn 0';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Xử lý khi thay đổi các trường trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingInfo({
      ...bookingInfo,
      [name]: value
    });
    
    // Clear error message khi người dùng typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  // Xử lý khi nhấn nút xác nhận đặt
  const handleConfirmBooking = async () => {
    if (!validateForm()) {
      return; // Dừng lại nếu form không hợp lệ
    }
    
    try {
      setIsSubmitting(true);
      
      // Lấy chuỗi thời gian đã format từ sự kiện để gửi cho doanh nghiệp
      let bookingTime = 'Thời gian sẽ được lấy từ sự kiện';
      if (eventInfo) {
        // Ưu tiên lấy từ timeslots JSON
        if (eventInfo.timeslots) {
          try {
            const timeslots = typeof eventInfo.timeslots === 'string' 
              ? JSON.parse(eventInfo.timeslots) 
              : eventInfo.timeslots;
            
            if (timeslots.slots && timeslots.slots.length > 0) {
              if (timeslots.slots.length === 1) {
                // Sự kiện 1 ngày
                const slot = timeslots.slots[0];
                if (slot.date && slot.start_time) {
                  const [year, month, day] = slot.date.split('-');
                  const formattedDate = `${day}/${month}/${year}`;
                  bookingTime = `${slot.day_name} ${formattedDate} (${slot.start_time})`;
                }
              } else {
                // Nhiều khung giờ - kiểm tra cùng ngày hay khác ngày
                const uniqueDates = [...new Set(timeslots.slots.map(slot => slot.date))];
                
                if (uniqueDates.length === 1) {
                  // Cùng ngày - format: Thứ X dd/mm/yyyy (giờ:phút)
                  const firstSlot = timeslots.slots[0];
                  const [year, month, day] = firstSlot.date.split('-');
                  const formattedDate = `${day}/${month}/${year}`;
                  bookingTime = `${firstSlot.day_name} ${formattedDate} (${firstSlot.start_time})`;
                } else {
                  // Khác ngày - hiển thị giờ đầu tiên của mỗi ngày
                  const dateGroups = {};
                  timeslots.slots.forEach(slot => {
                    if (!dateGroups[slot.date]) {
                      dateGroups[slot.date] = [];
                    }
                    dateGroups[slot.date].push(slot);
                  });
                  
                  const daySchedules = Object.keys(dateGroups)
                    .sort()
                    .map(date => {
                      const slotsOfDay = dateGroups[date].sort((a, b) => {
                        const timeA = a.start_time.split(':').map(Number);
                        const timeB = b.start_time.split(':').map(Number);
                        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                      });
                      const firstSlotOfDay = slotsOfDay[0];
                      const [year, month, day] = date.split('-');
                      const formattedDate = `${day}/${month}/${year}`;
                      return `${firstSlotOfDay.day_name} ${formattedDate} (${firstSlotOfDay.start_time})`;
                    });
                  
                  bookingTime = daySchedules.join(' • ');
                }
              }
            }
          } catch (error) {
            console.error('Lỗi parse timeslots:', error);
            // Fallback về start_time
            if (eventInfo.start_time) {
              try {
                const date = new Date(eventInfo.start_time);
                if (!isNaN(date.getTime())) {
                  bookingTime = date.toLocaleString('vi-VN');
                }
              } catch (startTimeError) {
                console.error('Lỗi parse start_time:', startTimeError);
              }
            }
          }
        } else if (eventInfo.start_time) {
          // Fallback về start_time legacy
          try {
            const date = new Date(eventInfo.start_time);
            if (!isNaN(date.getTime())) {
              bookingTime = date.toLocaleString('vi-VN');
            }
          } catch (legacyError) {
            console.error('Lỗi parse legacy start_time:', legacyError);
          }
        }
      }
      
      console.log('✅ Booking time formatted:', bookingTime);
      
      // Gọi API để tạo booking
      const bookingData = {
        event_id: eventId,
        enterprise_id: enterprise.enterprise_id,
        number_of_people: bookingInfo.attendeeCount,
        booking_time: bookingTime,
        notes: bookingInfo.notes
      };
      
      console.log('Booking data với thời gian từ sự kiện:', bookingData);
      
      await bookingService.createBooking(bookingData);
      
      // Hiển thị thông báo thành công
      setShowSuccess(true);
      
      // Tự động chuyển trang sau 2 giây
      setTimeout(() => {
        navigate(`/groups/${groupId}/event-manager`);
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi xác nhận đặt chỗ:', error);
      alert('Có lỗi xảy ra khi xác nhận đặt chỗ. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };
  // Xử lý khi nhấn nút trở về
  const handleBack = () => {
    // Hiển thị xác nhận nếu người dùng đã nhập dữ liệu
    const hasChanges = 
      bookingInfo.notes !== '';
    
    if (hasChanges && !showSuccess) {
      if (window.confirm('Bạn có thông tin chưa lưu. Bạn có chắc chắn muốn quay lại không?')) {
        navigate(`/groups/${groupId}/event-manager`);
      }
    } else {
      navigate(`/groups/${groupId}/event-manager`);
    }
  };

  // Xử lý các hành động điều hướng  // Các nút chức năng bên phải
  const rightButtons = [
    { label: 'Sự kiện', onClick: () => navigate(`/groups/${groupId}/event-manager`) },
    { label: 'Quản lý thời gian', onClick: () => navigate(`/groups/${groupId}/time-editor`) },
    { label: 'Quản lý vị trí và sở thích', onClick: () => navigate(`/groups/${groupId}/location-preference`) },
    { label: 'Lịch rảnh nhóm', onClick: () => navigate(`/groups/${groupId}/group-calendar`) },
    { label: 'Đề xuất địa điểm', onClick: () => navigate(`/groups/${groupId}/suggestion-list`) },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}      <GroupHeader 
        groupName={groupInfo.name || 'Đang tải...'}
        memberCount={groupInfo.memberCount || 0}
        showBackToGroups={true}
        isLeader={true}
        onBack={handleBack}
      />
      
      {/* Main Content */}      <LeaderLayout rightButtons={rightButtons} activePage="Sự kiện">
        {/* Success notification */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full animate-bounce-in">
              <div className="flex items-center justify-center text-green-500 mb-4">
                <HiOutlineCheckCircle className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Đặt chỗ thành công!</h3>
              <p className="text-gray-600 text-center mb-6">
                Thông tin đặt chỗ đã được gửi đến nơi kinh doanh. Bạn sẽ được chuyển hướng trong vài giây.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div className="bg-green-500 h-1.5 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white p-4 rounded-md shadow-sm">{/* Tiêu đề và nút hành động */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Thông tin đặt chỗ</h2>
            <div className="flex space-x-4">
              <button 
                onClick={handleBack}
                className="flex items-center justify-center bg-gray-200 py-2 px-6 rounded-md hover:bg-gray-300 transition-all text-gray-700 font-medium"
              >
                Huỷ
              </button>              <button 
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className={`flex items-center justify-center bg-purple-500 py-2 px-6 rounded-md hover:bg-purple-600 transition-all text-white font-medium ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : 'Xác nhận đặt chỗ'}
              </button>
            </div>
          </div>
            {/* Thông tin doanh nghiệp đã chọn */}
          {enterprise && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Doanh nghiệp đã chọn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <HiOutlineLocationMarker className="text-blue-600 mr-2 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 text-sm block">Tên doanh nghiệp</span>
                    <span className="font-medium">{enterprise.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <HiOutlinePhone className="text-blue-600 mr-2 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 text-sm block">Số điện thoại</span>
                    <span className="font-medium">{enterprise.phone}</span>
                  </div>
                </div>
                
                {enterprise.address && (
                  <div className="flex items-center">
                    <HiOutlineLocationMarker className="text-blue-600 mr-2 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 text-sm block">Địa chỉ</span>
                      <span className="font-medium">{enterprise.address}</span>
                    </div>
                  </div>
                )}
                
                {enterprise.opening_hours && (
                  <div className="flex items-center">
                    <HiOutlineCalendar className="text-blue-600 mr-2 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 text-sm block">Giờ mở cửa</span>
                      <span className="font-medium">{enterprise.opening_hours}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Form thông tin đặt chỗ */}
          <div className="bg-white p-4 rounded-lg shadow-sm">

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <HiOutlineUserGroup className="mr-2 text-purple-600" />
                <label className="text-gray-700 font-medium">Số lượng người tham gia</label>
              </div>
              <div className="relative">
                <div className="w-full p-3 bg-gray-50 border rounded-md text-gray-700">
                  {bookingInfo.attendeeCount} người đã xác nhận tham gia
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Số lượng người tham gia được lấy tự động từ thông tin sự kiện
                </p>
              </div>
            </div>

            {/* Thời gian đặt chỗ tự động lấy từ sự kiện */}
                        <div className="mb-6">
              <div className="flex items-center mb-2">
                <HiOutlineCalendar className="mr-2 text-purple-600" />
                <label className="text-gray-700 font-medium">Thời gian đặt chỗ</label>
              </div>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <span className="text-gray-700">
                  {(() => {
                    if (!eventInfo) return 'Sẽ sử dụng thời gian của sự kiện';
                    
                    // Ưu tiên lấy từ timeslots JSON
                    if (eventInfo.timeslots) {
                      try {
                        const timeslots = typeof eventInfo.timeslots === 'string' 
                          ? JSON.parse(eventInfo.timeslots) 
                          : eventInfo.timeslots;
                        
                        if (timeslots.slots && timeslots.slots.length > 0) {
                          if (timeslots.slots.length === 1) {
                            // Sự kiện 1 ngày
                            const slot = timeslots.slots[0];
                            if (slot.date && slot.start_time) {
                              try {
                                const datetime = new Date(`${slot.date}T${slot.start_time}:00`);
                                if (!isNaN(datetime.getTime())) {
                                  return datetime.toLocaleString('vi-VN');
                                }
                              } catch (error) {
                                console.error('Lỗi tạo datetime:', error);
                              }
                            }
                          } else {
                            // Nhiều khung giờ - kiểm tra cùng ngày hay khác ngày
                            const firstSlot = timeslots.slots[0];
                            const lastSlot = timeslots.slots[timeslots.slots.length - 1];
                            
                            // Kiểm tra xem tất cả slots có cùng ngày không
                            const uniqueDates = [...new Set(timeslots.slots.map(slot => slot.date))];
                            
                            if (uniqueDates.length === 1) {
                              // Cùng ngày - format: Thứ X dd/mm (giờ:phút)
                              const [year, month, day] = firstSlot.date.split('-');
                              const formattedDate = `${day}/${month}`;
                              return `${firstSlot.day_name} ${formattedDate} (${firstSlot.start_time})`;
                            } else {
                              // Khác ngày - hiển thị giờ đầu tiên của mỗi ngày
                              const dateGroups = {};
                              timeslots.slots.forEach(slot => {
                                if (!dateGroups[slot.date]) {
                                  dateGroups[slot.date] = [];
                                }
                                dateGroups[slot.date].push(slot);
                              });
                              
                              const daySchedules = Object.keys(dateGroups)
                                .sort()
                                .map(date => {
                                  const slotsOfDay = dateGroups[date].sort((a, b) => {
                                    // Sắp xếp theo thời gian (HH:MM format)
                                    const timeA = a.start_time.split(':').map(Number);
                                    const timeB = b.start_time.split(':').map(Number);
                                    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                                  });
                                  const firstSlotOfDay = slotsOfDay[0];
                                  // Format: Thứ X dd/mm (giờ:phút)
                                  const [year, month, day] = date.split('-');
                                  const formattedDate = `${day}/${month}`;
                                  return `${firstSlotOfDay.day_name} ${formattedDate} (${firstSlotOfDay.start_time})`;
                                });
                              
                              return daySchedules.join(' • ');
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Lỗi parse timeslots:', error);
                      }
                    }
                    
                    // Fallback về start_time legacy
                    if (eventInfo.start_time) {
                      try {
                        const date = new Date(eventInfo.start_time);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleString('vi-VN');
                        }
                      } catch (error) {
                        console.error('Lỗi parse start_time:', error);
                      }
                    }
                    
                    return 'Thời gian sẽ được lấy từ sự kiện';
                  })()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Thời gian đặt chỗ sẽ được lấy tự động từ thời gian của sự kiện
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <HiOutlineClipboardList className="mr-2 text-purple-600" />
                <label className="text-gray-700 font-medium">Ghi chú</label>
              </div>
              <div className="relative">
                <textarea
                  name="notes"
                  value={bookingInfo.notes}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-300 focus:outline-none resize-none"
                  rows="4"
                  placeholder="Thêm các ghi chú đặc biệt hoặc yêu cầu (nếu có)"
                />
              </div>
            </div>
          </div>
        </div>
      </LeaderLayout>
    </div>
  );
};

export default Booking;
