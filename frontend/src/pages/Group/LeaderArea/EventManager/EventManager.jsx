import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupHeader from '../../../../components/layoutPrimitives/GroupHeader';
import LeaderLayout from '../../../../components/layoutPrimitives/LeaderLayout';
import Event from '../../../../components/groupWidgets/EventManager/Event';
import { getGroupById } from '../../../../services/groupService';
import { createEvent, getEventsByGroupId, deleteEvent, updateEvent } from '../../../../services/eventService';
import { sendEventNotification } from '../../../../services/notificationService';
import EmailCustomizationModal from '../../../../components/EmailCustomizationModal';
import { HiOutlineCheckCircle, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUserGroup, HiOutlinePhone, HiOutlineClipboardList, HiOutlinePlus, HiOutlineEye, HiOutlineX, HiOutlinePencil, HiOutlineTrash, HiOutlineTag } from 'react-icons/hi';
import { getEnterpriseTypeLabel } from '../../../../utils/enterpriseUtils';
import Modal from '../../../../components/common/Modal';
import bookingService from '../../../../services/bookingService';
import timeslotService from '../../../../services/timeslotService';
import suggestionService from '../../../../services/suggestionService';
import LocationAutocomplete from '../../../../components/common/LocationAutocomplete';
import MapPicker from '../../../../components/common/MapPicker';
import MapPickerModal from '../../../../components/common/MapPickerModal';

// Inject CSS animation styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;
  document.head.appendChild(styleSheet);
}

const EventManager = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  // State cho thông tin sự kiện
  const [eventInfo, setEventInfo] = useState({
    name: 'Đang tải...',
    memberCount: 0,
    eventDetails: {
      name: '',
      location: '',
      time: '',
      locationType: '',
      matchRate: '0%',
      bookingStatus: 'Chưa đặt',
      notificationStatus: 'Chưa thông báo',
      attendeeCount: 0
    }
  });
  
  // State để theo dõi loading
  const [isLoading, setIsLoading] = useState(true);
  
  // State cho thông báo đặt chỗ thành công
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  
  // State cho modal tạo sự kiện
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventName, setEventName] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]); // Mảng các slot thời gian đã chọn
  const [selectedVenue, setSelectedVenue] = useState(''); // Địa điểm đã chọn (có thể nhập tay)
  const [venueInputMode, setVenueInputMode] = useState('manual'); // 'manual', 'map', 'suggestion'
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [selectedSuggestedPlace, setSelectedSuggestedPlace] = useState('');
  // State cho location từ autocomplete và map
  const [selectedLocationData, setSelectedLocationData] = useState(null);
  const [manualLocationInput, setManualLocationInput] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  // State với default data để đảm bảo luôn có data hiển thị
  const [freeSlots, setFreeSlots] = useState([]); // slot thời gian >60% thành viên rảnh
  
  // State cho bảng thời gian
  const [availabilityGrid, setAvailabilityGrid] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [dragMode, setDragMode] = useState(null); // 'add' hoặc 'remove'
  const [selectedCells, setSelectedCells] = useState(new Set()); // Cells được chọn tạm thời khi drag
  const [showTimeDetails, setShowTimeDetails] = useState(false);
  
  // State cho thông báo tạo sự kiện
  const [showCreateSuccess, setShowCreateSuccess] = useState(false);
  const [showCreateError, setShowCreateError] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionCountdown, setSuggestionCountdown] = useState(0);
  
  // State cho xóa sự kiện
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showNotifySuccess, setShowNotifySuccess] = useState(false);
  const [showNotifyError, setShowNotifyError] = useState(false);
  const [notifyErrorMessage, setNotifyErrorMessage] = useState('');
  const [currentEventId, setCurrentEventId] = useState(null);
  
  // State cho chỉnh sửa sự kiện
  const [showEditWarning, setShowEditWarning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State cho quyền leader
  const [isUserLeader, setIsUserLeader] = useState(false);
  
  // State cho tuần hiện tại (bắt đầu từ thứ 2 ngày 16/6/2025)
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2025, 5, 16));
  
  // State cho booking management
  const [showBookingManagement, setShowBookingManagement] = useState(false);
  const [activeBookingTab, setActiveBookingTab] = useState('my-bookings');
  const [bookings, setBookings] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // State cho edit và cancel booking
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditBooking, setShowEditBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isCancelingBooking, setIsCancelingBooking] = useState(false);
  
  // Functions để điều hướng tuần
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };
  
  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };
  
  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Tính khoảng cách đến thứ 2
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    setCurrentWeekStart(monday);
  };
  
  // Effect để cập nhật trạng thái đặt chỗ khi quay về từ trang booking
  useEffect(() => {
    const handleBookingUpdate = () => {
      // Cập nhật trạng thái đặt chỗ khi có thay đổi
      if (currentEventId) {
        updateEventBookingStatus();
      }
    };

    // Lắng nghe sự kiện focus để cập nhật khi quay về tab
    window.addEventListener('focus', handleBookingUpdate);
    
    return () => {
      window.removeEventListener('focus', handleBookingUpdate);
    };
  }, [currentEventId]);

  // Lấy thông tin nhóm khi component được mount
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true);
        console.log('🚀 Fetching group data for groupId:', groupId);
        
        const response = await getGroupById(groupId);
        console.log('📦 Group response:', response);
        
        if (response.success) {
          // Kiểm tra quyền leader
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const isLeader = response.data.leader_id === currentUser.user_id;
          setIsUserLeader(isLeader);
          console.log('👑 User is leader:', isLeader, 'Leader ID:', response.data.leader_id, 'User ID:', currentUser.user_id);
          
          // Merge với default eventDetails nếu không có
          const mergedEventInfo = {
            ...response.data,
            eventDetails: {
              name: '',
              location: '',
              time: '',
              locationType: '',
              matchRate: '0%',
              bookingStatus: 'Chưa đặt',
              notificationStatus: 'Chưa thông báo',
              attendeeCount: 0,
              ...(response.data.eventDetails || {})
            }
          };
          
          // Kiểm tra xem có thông tin đặt chỗ được lưu không
          const bookingData = localStorage.getItem('bookingConfirmed');
          
          if (bookingData) {
            const booking = JSON.parse(bookingData);
            
            // Kiểm tra xem đặt chỗ có phải cho nhóm này không và còn mới không (trong vòng 5 phút)
            const isRecent = (new Date() - new Date(booking.timestamp)) < 5 * 60 * 1000; // 5 phút
            
            if (booking.groupId === groupId && isRecent) {
              // Cập nhật trạng thái đặt chỗ
              mergedEventInfo.eventDetails = {
                ...mergedEventInfo.eventDetails,
                bookingStatus: 'Đã xác nhận',
                attendeeCount: booking.attendeeCount,
                bookerName: booking.bookerName
              };
              
              // Hiển thị thông báo đặt chỗ thành công
              setShowBookingSuccess(true);
              
              // Ẩn thông báo sau 5 giây
              setTimeout(() => {
                setShowBookingSuccess(false);
                localStorage.removeItem('bookingConfirmed');
              }, 5000);
            }
          }
          
          setEventInfo(mergedEventInfo);
          console.log('✅ Event info set:', mergedEventInfo);
          
          // Lấy thông tin sự kiện của nhóm từ database
          const eventsResponse = await getEventsByGroupId(groupId);
          console.log('📋 Events response:', eventsResponse);
          if (eventsResponse.success && eventsResponse.data.length > 0) {
            const latestEvent = eventsResponse.data[0]; // Lấy sự kiện mới nhất
            console.log('📋 Latest event:', latestEvent);
            console.log('🎯 Match rate from database:', latestEvent.match_rate);
            
            // Lưu event ID để có thể xóa
            console.log('🔍 Setting currentEventId:', latestEvent.event_id);
            setCurrentEventId(latestEvent.event_id);
            
            // Format thời gian - ưu tiên JSON timeslots
            let formattedTime = 'Chưa xác định thời gian';
            
            console.log('🔍 Debug latest event:', {
              hasTimeslots: !!latestEvent.timeslots,
              timeslots: latestEvent.timeslots,
              start_time: latestEvent.start_time,
              end_time: latestEvent.end_time
            });

            if (latestEvent.timeslots) {
              // Sử dụng JSON timeslots nếu có
              try {
                // Kiểm tra xem timeslots đã là object hay string
                const timeslots = typeof latestEvent.timeslots === 'string' 
                  ? JSON.parse(latestEvent.timeslots) 
                  : latestEvent.timeslots;
                console.log('📋 Parsed timeslots (initial):', timeslots);
                formattedTime = formatTimeslotsDisplay(timeslots);
                console.log('📋 Formatted time from JSON (initial):', formattedTime);
              } catch (error) {
                console.error('❌ Lỗi parse timeslots JSON:', error);
                // Fallback về cách cũ
                formattedTime = formatLegacyTime(latestEvent.start_time, latestEvent.end_time);
              }
            } else if (latestEvent.start_time && latestEvent.end_time) {
              // Fallback về cách cũ nếu không có JSON
              console.log('📋 Using legacy time format (initial)');
              formattedTime = formatLegacyTime(latestEvent.start_time, latestEvent.end_time);
            }
            
            // Kiểm tra trạng thái đặt chỗ từ database
            let bookingStatus = 'Chưa đặt';
            try {
              // Lấy thông tin đặt chỗ cho sự kiện này
              const bookingsResponse = await bookingService.getEventBookings(latestEvent.event_id);
              if (bookingsResponse && bookingsResponse.length > 0) {
                // Kiểm tra xem có đặt chỗ nào được xác nhận không
                const confirmedBooking = bookingsResponse.find(booking => booking.status === 'confirmed');
                if (confirmedBooking) {
                  bookingStatus = 'Đã đặt';
                }
              }
            } catch (error) {
              console.log('⚠️ Không thể lấy thông tin đặt chỗ:', error);
              // Giữ nguyên trạng thái mặc định 'Chưa đặt'
            }

            // Cập nhật thông tin sự kiện từ database
            const matchRateDisplay = latestEvent.match_rate ? `${latestEvent.match_rate}%` : '0%';
            console.log('🎯 Setting match rate display:', matchRateDisplay);
            
            const eventDetails = {
              name: latestEvent.name || '',
              location: latestEvent.venue || 'Chưa xác định địa điểm',
              time: formattedTime,
              locationType: 'Không xác định',
              matchRate: matchRateDisplay,
              bookingStatus: bookingStatus,
              notificationStatus: latestEvent.notification_status === 'sent' ? 'Đã thông báo' : 'Chưa thông báo',
              attendeeCount: Math.max(latestEvent.participant_count || 0, 1),
              // Thêm thông tin thời gian để kiểm tra khi xóa
              start_time: latestEvent.start_time,
              end_time: latestEvent.end_time,
              // Thêm timeslots để có thể parse khi edit
              timeslots: latestEvent.timeslots,
              // Thêm event_id vào eventDetails để backup
              event_id: latestEvent.event_id
            };
            
            setEventInfo(prev => ({
              ...prev,
              eventDetails: eventDetails
            }));
            
            console.log('✅ Event details loaded from database:', eventDetails);
          }
        } else {
          console.error('❌ Lỗi khi lấy thông tin nhóm:', response.message);
          // Không alert, chỉ log để debug
        }
      } catch (error) {
        console.error('💥 Lỗi khi lấy thông tin nhóm:', error);
        // Không alert, chỉ log để debug
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  // Effect để handle global mouse up (kết thúc drag)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging || dragStart) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  // Helper functions để tính availability grid và slots
  const calculateAvailabilityGrid = (groupTimeslots, totalMembers) => {
    const grid = {};
    const hoursArray = Array.from({ length: 16 }, (_, i) => `${7 + i}:00`);
    
    if (!totalMembers || totalMembers === 0) {
      console.log('⚠️ Không có thông tin số thành viên cho grid');
      return grid;
    }

    // Tạo grid cho tuần hiện tại
    const startOfWeek = new Date(currentWeekStart);

    // Tạo chính xác 7 ngày của tuần
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayOfWeek = currentDate.getDay();
      const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = dayNames[dayOfWeek];

      if (!grid[dayName]) grid[dayName] = {};
      if (!grid[dayName][dateStr]) grid[dayName][dateStr] = {};

      // Tính availability cho từng giờ
      hoursArray.forEach(hour => {
        const targetHour = parseInt(hour.split(':')[0]);
        const availableUsers = new Set();

        groupTimeslots.forEach(user => {
          user.timeslots?.forEach(slot => {
            const slotStart = new Date(slot.start_time);
            const slotEnd = new Date(slot.end_time);
            const slotDate = new Date(slotStart);
            const slotYear = slotDate.getFullYear();
            const slotMonth = (slotDate.getMonth() + 1).toString().padStart(2, '0');
            const slotDay = slotDate.getDate().toString().padStart(2, '0');
            const slotDateString = `${slotYear}-${slotMonth}-${slotDay}`;

            if (slotDateString === dateStr) {
              const slotStartHour = slotStart.getHours();
              const slotEndHour = slotEnd.getHours();

              if (targetHour >= slotStartHour && targetHour < slotEndHour) {
                availableUsers.add(user.user_id);
              }
            }
          });
        });

        const availableCount = availableUsers.size;
        const percentage = Math.round((availableCount / totalMembers) * 100);
        grid[dayName][dateStr][hour] = percentage;
      });
    }

    return grid;
  };

  const calculateAvailableSlots = (groupTimeslots, totalMembers) => {
    const slots = [];
    
    if (!totalMembers || totalMembers === 0) {
      console.log('⚠️ Không có thông tin số thành viên');
      return slots;
    }

    // Lấy tất cả ngày trong tuần hiện tại
    const startOfPeriod = new Date(currentWeekStart);
    const endOfPeriod = new Date(currentWeekStart);
    endOfPeriod.setDate(startOfPeriod.getDate() + 6); // 7 ngày
    const today = new Date();
    
    console.log(`📅 Tính slots cho tuần: ${startOfPeriod.toISOString().split('T')[0]} đến ${endOfPeriod.toISOString().split('T')[0]}`);
    
    // Lặp qua tất cả ngày trong tuần
    for (let currentDate = new Date(startOfPeriod); currentDate <= endOfPeriod; currentDate.setDate(currentDate.getDate() + 1)) {
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayOfWeek = currentDate.getDay();
      const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = dayNames[dayOfWeek];
      
      // Bỏ qua nếu là ngày trong quá khứ (trừ hôm nay)
      const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      if (currentDate < today && dateStr !== todayStr) {
        continue;
      }
      
      // Kiểm tra các khung giờ chính
      const timeFrames = [
        { start: 7, end: 9, label: '07:00-09:00' },
        { start: 9, end: 11, label: '09:00-11:00' },
        { start: 11, end: 13, label: '11:00-13:00' },
        { start: 14, end: 16, label: '14:00-16:00' },
        { start: 16, end: 18, label: '16:00-18:00' },
        { start: 19, end: 21, label: '19:00-21:00' }
      ];
      
      timeFrames.forEach((frame, index) => {
        const availableUsers = new Set();
        const frameHours = [];
        for (let h = frame.start; h < frame.end; h++) {
          frameHours.push(Math.floor(h));
        }
        
        groupTimeslots.forEach(user => {
          let userAvailableInFrame = false;
          
          user.timeslots?.forEach(slot => {
            const slotStart = new Date(slot.start_time);
            const slotEnd = new Date(slot.end_time);
            
            const slotDate = new Date(slotStart);
            const slotYear = slotDate.getFullYear();
            const slotMonth = (slotDate.getMonth() + 1).toString().padStart(2, '0');
            const slotDay = slotDate.getDate().toString().padStart(2, '0');
            const slotDateString = `${slotYear}-${slotMonth}-${slotDay}`;
            
            if (slotDateString === dateStr) {
              const slotStartHour = slotStart.getHours();
              const slotEndHour = slotEnd.getHours();
              
              frameHours.forEach(targetHour => {
                if (targetHour >= slotStartHour && targetHour < slotEndHour) {
                  userAvailableInFrame = true;
                }
              });
            }
          });
          
          if (userAvailableInFrame) {
            availableUsers.add(user.user_id);
          }
        });

        const availableCount = availableUsers.size;
        const percentage = Math.round((availableCount / totalMembers) * 100);
        
        if (percentage >= 60) {
          slots.push({
            dayName,
            dateStr,
            timeFrame: frame.label,
            percentage,
            availableCount,
            totalMembers
          });
        }
      });
    }

    return slots;
  };

  // Effect để reload dữ liệu khi tuần thay đổi
  useEffect(() => {
    if (groupId && currentWeekStart && eventInfo.memberCount > 0) {
      // Reset selected time slots khi chuyển tuần (trừ khi đang ở chế độ chỉnh sửa)
      if (!isEditMode) {
        setSelectedTimeSlots([]);
      }
      
      // Reload timeslots data cho tuần mới
      const reloadWeekData = async () => {
        try {
          console.log('🔄 Reloading data for week:', currentWeekStart.toISOString().split('T')[0]);
          const response = await timeslotService.getGroupTimeslots(groupId);
          
          if (response.success && response.data) {
            const groupTimeslots = response.data;
            const grid = calculateAvailabilityGrid(groupTimeslots, eventInfo.memberCount);
            setAvailabilityGrid(grid);
            
            const availableSlots = calculateAvailableSlots(groupTimeslots, eventInfo.memberCount);
            setFreeSlots(availableSlots);
            
            console.log('✅ Week data reloaded');
          }
        } catch (error) {
          console.error('❌ Error reloading week data:', error);
        }
      };
      
      reloadWeekData();
    }
  }, [currentWeekStart, groupId, eventInfo.memberCount, isEditMode]);

  // Effect để cập nhật percentage cho selected slots khi availability grid thay đổi (trong edit mode)
  useEffect(() => {
    if (isEditMode && selectedTimeSlots.length > 0 && Object.keys(availabilityGrid).length > 0) {
      const updatedSlots = selectedTimeSlots.map(slot => {
        const actualPercentage = availabilityGrid[slot.dayName]?.[slot.dateStr]?.[slot.hour] || slot.percentage;
        return {
          ...slot,
          percentage: actualPercentage
        };
      });
      
      // Chỉ cập nhật nếu có thay đổi percentage
      const hasChanges = updatedSlots.some((slot, index) => 
        slot.percentage !== selectedTimeSlots[index].percentage
      );
      
      if (hasChanges) {
        setSelectedTimeSlots(updatedSlots);
        console.log('🔄 Updated selected slots with grid data:', updatedSlots);
      }
    }
  }, [availabilityGrid, isEditMode]); // Không include selectedTimeSlots để tránh loop

  const handleViewEvent = () => {
    alert('Chi tiết sự kiện sẽ được hiển thị tại đây');
  };
  
  const handleNotifyEvent = async () => {
    if (!currentEventId) {
      alert('Không tìm thấy sự kiện để thông báo');
      return;
    }

    // Mở modal tùy chỉnh email thay vì gửi trực tiếp
    setShowEmailModal(true);
  };

  const handleSendCustomEmail = async (customContent) => {
    setIsNotifying(true);
    try {
      const response = await sendEventNotification(currentEventId, customContent);
      
      if (response.success) {
        setShowEmailModal(false);
        setShowNotifySuccess(true);
        setTimeout(() => setShowNotifySuccess(false), 5000);
        
        // Cập nhật trạng thái thông báo trong eventDetails
        setEventInfo(prev => ({
          ...prev,
          eventDetails: {
            ...prev.eventDetails,
            notificationStatus: 'Đã thông báo'
          }
        }));
      } else {
        setNotifyErrorMessage(response.message);
        setShowNotifyError(true);
        setTimeout(() => setShowNotifyError(false), 5000);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setNotifyErrorMessage('Có lỗi xảy ra khi gửi thông báo');
      setShowNotifyError(true);
      setTimeout(() => setShowNotifyError(false), 5000);
    } finally {
      setIsNotifying(false);
    }
  };

  const handleCloseEmailModal = () => {
    if (!isNotifying) {
      setShowEmailModal(false);
    }
  };
  
  const handleBookingContact = async () => {
    // Nếu chưa mở modal, fetch data trước khi hiển thị
    if (!showBookingManagement) {
      await fetchBookingData();
    }
    setShowBookingManagement(!showBookingManagement);
  };
  
  const fetchBookingData = async () => {
    try {
      setBookingLoading(true);
      
      // Fetch bookings và enterprises song song
      const [bookingsData, enterprisesData] = await Promise.all([
        bookingService.getMyBookings(),
        bookingService.getEnterprises()
      ]);
      
      setBookings(bookingsData);
      setEnterprises(enterprisesData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu booking:', error);
    } finally {
      setBookingLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Đã từ chối', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleEnterpriseSelect = (enterprise) => {
    // Cần có eventId để đặt chỗ
    if (!currentEventId) {
      alert('Cần tạo sự kiện trước khi đặt chỗ. Vui lòng tạo sự kiện mới.');
      return;
    }
    
    // Điều hướng đến trang đặt chỗ với thông tin enterprise
    navigate(`/groups/${groupId}/booking`, {
      state: {
        eventId: currentEventId,
        enterprise: enterprise
      }
    });
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Thời gian không hợp lệ';
      }
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Lỗi format datetime:', error);
      return 'Lỗi hiển thị thời gian';
    }
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelConfirm(true);
  };

  // Hàm cập nhật trạng thái đặt chỗ của sự kiện
  const updateEventBookingStatus = async () => {
    if (!currentEventId) return;
    
    try {
      let bookingStatus = 'Chưa đặt';
      const bookingsResponse = await bookingService.getEventBookings(currentEventId);
      if (bookingsResponse && bookingsResponse.length > 0) {
        const confirmedBooking = bookingsResponse.find(booking => booking.status === 'confirmed');
        if (confirmedBooking) {
          bookingStatus = 'Đã đặt';
        }
      }
      
      // Cập nhật trạng thái trong eventInfo
      setEventInfo(prev => ({
        ...prev,
        eventDetails: {
          ...prev.eventDetails,
          bookingStatus: bookingStatus
        }
      }));
    } catch (error) {
      console.log('⚠️ Không thể cập nhật trạng thái đặt chỗ:', error);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    
    try {
      setIsCancelingBooking(true);
      await bookingService.cancelBooking(selectedBooking.booking_id);
      
      // Refresh booking list
      await fetchBookingData();
      
      // Cập nhật trạng thái đặt chỗ của sự kiện
      await updateEventBookingStatus();
      
      setShowCancelConfirm(false);
      setSelectedBooking(null);
      alert('Hủy đặt chỗ thành công!');
    } catch (error) {
      console.error('Lỗi khi hủy đặt chỗ:', error);
      alert('Có lỗi xảy ra khi hủy đặt chỗ. Vui lòng thử lại.');
    } finally {
      setIsCancelingBooking(false);
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking({
      ...booking,
      attendee_count: booking.number_of_people || 1,
      booking_time: booking.booking_time || '',
      notes: booking.notes || ''
    });
    setShowEditBooking(true);
  };

  const handleSaveEditBooking = async () => {
    if (!editingBooking) return;
    
    try {
      setIsCancelingBooking(true);
      
      // Sử dụng booking_time trực tiếp vì giờ là text format
      let formattedBookingTime = editingBooking.booking_time;
      
      const updateData = {
        number_of_people: editingBooking.attendee_count,
        booking_time: formattedBookingTime,
        notes: editingBooking.notes
      };
      
      await bookingService.updateBooking(editingBooking.booking_id, updateData);
      
      // Refresh booking list
      await fetchBookingData();
      
      setShowEditBooking(false);
      setEditingBooking(null);
      alert('Cập nhật đặt chỗ thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật đặt chỗ:', error);
      alert('Có lỗi xảy ra khi cập nhật đặt chỗ. Vui lòng thử lại.');
    } finally {
      setIsCancelingBooking(false);
    }
  };
    const handleEditEvent = () => {
    // Kiểm tra xem có sự kiện để chỉnh sửa không
    if (!eventInfo.eventDetails?.name) {
      alert('Không có sự kiện nào để chỉnh sửa');
      return;
    }
    
    // Kiểm tra xem sự kiện có đang diễn ra không
    const now = new Date();
    const startTime = eventInfo.eventDetails?.start_time ? new Date(eventInfo.eventDetails.start_time) : null;
    const endTime = eventInfo.eventDetails?.end_time ? new Date(eventInfo.eventDetails.end_time) : null;
    
    const isEventOngoing = startTime && endTime && now >= startTime && now <= endTime;
    
    if (isEventOngoing) {
      // Hiển thị cảnh báo nếu sự kiện đang diễn ra
      setShowEditWarning(true);
    } else {
      // Mở modal chỉnh sửa trực tiếp nếu sự kiện chưa diễn ra
      openEditModal();
    }
  };
  
  // Function để mở modal chỉnh sửa
  const openEditModal = async () => {
    // Load dữ liệu hiện tại vào form
    setEventName(eventInfo.eventDetails?.name || '');
    // Nếu location là "Chưa xác định địa điểm" thì set về rỗng cho form
    const currentLocation = eventInfo.eventDetails?.location === 'Chưa xác định địa điểm' ? '' : (eventInfo.eventDetails?.location || '');
    setSelectedVenue(currentLocation);
    setManualLocationInput(currentLocation);
    setVenueInputMode('manual');
    setSelectedLocationData(null);
    setSelectedSuggestedPlace('');
    
    // Parse thời gian từ database thành selectedTimeSlots
    let parsedTimeSlots = [];
    
    // Ưu tiên parse từ JSON timeslots nếu có
    if (eventInfo.eventDetails?.timeslots) {
      try {
        const timeslots = typeof eventInfo.eventDetails.timeslots === 'string' 
          ? JSON.parse(eventInfo.eventDetails.timeslots) 
          : eventInfo.eventDetails.timeslots;
        
        // Convert JSON timeslots thành selectedTimeSlots format
        parsedTimeSlots = timeslots.slots.map(slot => ({
          dayName: slot.day_name,
          dateStr: slot.date,
          hour: slot.start_time,
          percentage: slot.percentage || 100,
          key: `${slot.date}_${slot.start_time}`
        }));
      } catch (error) {
        console.error('❌ Lỗi parse JSON timeslots:', error);
        // Fallback về legacy parsing
        parsedTimeSlots = parseTimeToSlots(
          eventInfo.eventDetails?.start_time, 
          eventInfo.eventDetails?.end_time
        );
      }
    } else {
      // Fallback về legacy parsing nếu không có JSON timeslots
      parsedTimeSlots = parseTimeToSlots(
        eventInfo.eventDetails?.start_time, 
        eventInfo.eventDetails?.end_time
      );
    }
    
    // Tự động chuyển đến tuần chứa sự kiện nếu cần
    let needWeekChange = false;
    if (parsedTimeSlots.length > 0) {
      // Lấy ngày đầu tiên từ parsedTimeSlots (có thể từ JSON hoặc legacy)
      const firstSlot = parsedTimeSlots[0];
      let eventDate;
      
      if (firstSlot.dateStr) {
        // Từ JSON timeslots - dateStr format: "2025-06-16"
        eventDate = new Date(firstSlot.dateStr);
      } else if (eventInfo.eventDetails?.start_time) {
        // Fallback từ legacy start_time
        eventDate = new Date(eventInfo.eventDetails.start_time);
      }
      
      if (eventDate) {
        const eventDayOfWeek = eventDate.getDay(); // 0 = CN, 1 = T2, ...
        const mondayOffset = eventDayOfWeek === 0 ? -6 : 1 - eventDayOfWeek;
        const eventWeekStart = new Date(eventDate);
        eventWeekStart.setDate(eventDate.getDate() + mondayOffset);
        
        // So sánh với tuần hiện tại
        const currentWeekTime = currentWeekStart.getTime();
        const eventWeekTime = eventWeekStart.getTime();
        
        if (currentWeekTime !== eventWeekTime) {
          needWeekChange = true;
          setCurrentWeekStart(eventWeekStart);
          
          // Đợi để availability grid được cập nhật
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    // Set selected time slots sau khi đã chuyển tuần
    // Nếu đã chuyển tuần, đợi grid reload xong rồi mới set slots
    if (needWeekChange) {
      // Đợi thêm một chút để grid được reload hoàn toàn
      setTimeout(() => {
        // Re-parse slots với availability grid mới
        const updatedSlots = parsedTimeSlots.map(slot => {
          const actualPercentage = availabilityGrid[slot.dayName]?.[slot.dateStr]?.[slot.hour] || 0;
          return {
            ...slot,
            percentage: actualPercentage
          };
        });
        
        setSelectedTimeSlots(updatedSlots);
      }, 800); // Tăng thời gian đợi để đảm bảo grid được load
    } else {
      // Nếu không cần chuyển tuần, set slots ngay với percentage từ grid hiện tại
      const updatedSlots = parsedTimeSlots.map(slot => {
        const actualPercentage = availabilityGrid[slot.dayName]?.[slot.dateStr]?.[slot.hour] || 0;
        return {
          ...slot,
          percentage: actualPercentage
        };
      });
      
      setSelectedTimeSlots(updatedSlots);
    }
    
    // Đặt chế độ chỉnh sửa và mở modal
    setIsEditMode(true);
    setShowCreateModal(true);
    setShowEditWarning(false);
  };
  
  // Helper function để tính end_time từ start_time của slot
  const calculateEndTimeFromSlot = (startHour) => {
    const hour = parseInt(startHour.split(':')[0]);
    const minute = parseInt(startHour.split(':')[1] || 0);
    const endHour = hour + 1; // Mỗi slot 1 tiếng
    return `${endHour}:${minute.toString().padStart(2, '0')}`;
  };

  // Helper function để format hiển thị từ JSON timeslots
  const formatTimeslotsDisplay = (timeslots) => {
    if (!timeslots || !timeslots.slots || timeslots.slots.length === 0) {
      return 'Chưa xác định thời gian';
    }

    if (timeslots.type === 'single') {
      const slot = timeslots.slots[0];
      // Format ngày từ "2025-06-16" thành "16/06"
      const [year, month, day] = slot.date.split('-');
      const formattedDate = `${day}/${month}`;
      return `${slot.day_name} ${formattedDate} (${slot.start_time} - ${slot.end_time})`;
    } else {
             // Multiple slots - sử dụng formatMultiDayTimeDisplay
       const slotsForDisplay = timeslots.slots.map(slot => ({
         dayName: slot.day_name,
         dateStr: slot.date,
         hour: slot.start_time,
         percentage: slot.percentage || 100
       }));
       
       return formatMultiDayTimeDisplay(slotsForDisplay);
    }
  };

  // Helper function để format thời gian legacy (fallback)
  const formatLegacyTime = (startTime, endTime) => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    // Tạo dayName từ startDate
    const dayOfWeek = startDate.getDay();
    const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[dayOfWeek];
    
    // Format ngày
    const year = startDate.getFullYear();
    const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const day = startDate.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Format giờ
    const startHour = `${startDate.getHours()}:${startDate.getMinutes().toString().padStart(2, '0')}`;
    const endHour = `${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    return `${dayName} ${dateStr}, ${startHour} - ${endHour}`;
  };

  // Helper function để format hiển thị nhiều ngày từ selectedTimeSlots
  const formatMultiDayTimeDisplay = (slots) => {
    if (!slots || slots.length === 0) {
      return 'Chưa xác định thời gian';
    }

    // Nhóm slots theo ngày
    const slotsByDay = {};
    slots.forEach(slot => {
      const key = `${slot.dayName} ${slot.dateStr}`;
      if (!slotsByDay[key]) {
        slotsByDay[key] = [];
      }
      slotsByDay[key].push(slot);
    });

    // Format từng ngày
    const dayDisplays = Object.entries(slotsByDay).map(([dayKey, daySlots]) => {
      // Sắp xếp slots theo giờ
      daySlots.sort((a, b) => {
        const hourA = parseInt(a.hour.split(':')[0]);
        const hourB = parseInt(b.hour.split(':')[0]);
        return hourA - hourB;
      });

      // Tìm các khoảng thời gian liên tục
      const timeRanges = [];
      let currentRange = { start: daySlots[0], end: daySlots[0] };

      for (let i = 1; i < daySlots.length; i++) {
        const prevHour = parseInt(currentRange.end.hour.split(':')[0]);
        const currentHour = parseInt(daySlots[i].hour.split(':')[0]);

        if (currentHour === prevHour + 1) {
          // Liên tục, mở rộng range
          currentRange.end = daySlots[i];
        } else {
          // Không liên tục, kết thúc range hiện tại và bắt đầu range mới
          timeRanges.push(currentRange);
          currentRange = { start: daySlots[i], end: daySlots[i] };
        }
      }
      timeRanges.push(currentRange);

      // Format các ranges cho ngày này
      const rangeDisplays = timeRanges.map(range => {
        const startHour = range.start.hour;
        const endHour = calculateEndTimeFromSlot(range.end.hour);
        return `${startHour}-${endHour}`;
      });

      // dayKey format: "Thứ 2 2025-06-16"
      const dayParts = dayKey.split(' ');
      const dayName = dayParts.slice(0, 2).join(' '); // "Thứ 2"
      const dateStr = dayParts[2]; // "2025-06-16"
      
      // Format ngày tháng năm từ "2025-06-16" thành "16/06"
      const [year, month, day] = dateStr.split('-');
      const formattedDate = `${day}/${month}`;
      
      return `${dayName} ${formattedDate} (${rangeDisplays.join(', ')})`;
    });

    // Hiển thị đầy đủ tất cả các ngày, ngắt dòng nếu quá dài
    const fullDisplay = dayDisplays.join(' • ');
    
    // Nếu quá dài (hơn 100 ký tự), chia thành nhiều dòng
    if (fullDisplay.length > 100) {
      return dayDisplays.join('\n• ');
    }
    
    return fullDisplay;
  };

  // Function để parse thời gian từ database thành time slots
  const parseTimeToSlots = (startTime, endTime) => {
    if (!startTime || !endTime) return [];
    
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      // Tính toán các slot từ start đến end (mỗi slot 1 giờ)
      const slots = [];
      const current = new Date(start);
      
      while (current < end) {
        const year = current.getFullYear();
        const month = (current.getMonth() + 1).toString().padStart(2, '0');
        const day = current.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const hour = `${current.getHours()}:00`; // Không pad số 0 để khớp với grid format
        
        // Tính dayName
        const dayOfWeek = current.getDay();
        const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const dayName = dayNames[dayOfWeek];
        
        const slotKey = `${dateStr}_${hour}`;
        
        // Lấy percentage thực từ availability grid
        const actualPercentage = availabilityGrid[dayName]?.[dateStr]?.[hour] || 0;
        
        slots.push({
          dayName,
          dateStr,
          hour,
          percentage: actualPercentage,
          key: slotKey
        });
        
        console.log('🔧 Parsed slot:', { 
          dayName, 
          dateStr, 
          hour, 
          slotKey, 
          actualPercentage,
          hasGridData: !!availabilityGrid[dayName]?.[dateStr]?.[hour],
          gridHours: availabilityGrid[dayName]?.[dateStr] ? Object.keys(availabilityGrid[dayName][dateStr]) : []
        });
        
        // Tăng 1 giờ
        current.setHours(current.getHours() + 1);
      }
      
      console.log('🕒 Parsed time slots from database:', {
        startTime,
        endTime,
        parsedSlots: slots
      });
      
      return slots;
    } catch (error) {
      console.error('❌ Lỗi khi parse thời gian:', error);
      return [];
    }
  };

  // Function để xử lý xóa sự kiện
  const handleDeleteEvent = () => {
    console.log('🗑️ handleDeleteEvent called, currentEventId:', currentEventId);
    console.log('🗑️ eventInfo.eventDetails:', eventInfo.eventDetails);
    
    // Lấy event ID từ currentEventId hoặc từ eventDetails
    const eventId = currentEventId || eventInfo.eventDetails?.event_id;
    console.log('🗑️ Final eventId to delete:', eventId);
    
    if (!eventId) {
      alert('Không tìm thấy sự kiện để xóa');
      return;
    }
    
    // Tạm thời set currentEventId nếu chưa có
    if (!currentEventId && eventId) {
      setCurrentEventId(eventId);
    }
    
    setShowDeleteConfirm(true);
  };

  // Function để xác nhận xóa sự kiện
  const handleConfirmDelete = async () => {
    if (!currentEventId) return;
    
    setIsDeletingEvent(true);
    try {
      const response = await deleteEvent(currentEventId);
      
      if (response.success) {
        // Xóa thành công, reset state
        setCurrentEventId(null);
        setEventInfo(prev => ({
          ...prev,
          eventDetails: {
            name: '',
            location: '',
            time: '',
            locationType: '',
            matchRate: '0%',
            bookingStatus: 'Chưa đặt',
            notificationStatus: 'Chưa thông báo',
            attendeeCount: 0
          }
        }));
        
        setShowDeleteConfirm(false);
        alert('Đã xóa sự kiện thành công!');
      } else {
        alert('Không thể xóa sự kiện: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi xóa sự kiện:', error);
      alert('Có lỗi xảy ra khi xóa sự kiện');
    } finally {
      setIsDeletingEvent(false);
    }
  };

  // Function để hủy xóa sự kiện
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  // Các nút chức năng bên phải
  const rightButtons = [
    { label: 'Sự kiện', onClick: handleViewEvent },
    { label: 'Quản lý thời gian', onClick: () => navigate(`/groups/${groupId}/time-editor`) },
    { label: 'Quản lý vị trí và sở thích', onClick: () => navigate(`/groups/${groupId}/location-preference`) },
    { label: 'Lịch rảnh nhóm', onClick: () => navigate(`/groups/${groupId}/group-calendar`) },
    { label: 'Đề xuất địa điểm', onClick: () => navigate(`/groups/${groupId}/suggestion-list`) },
  ];





  // Function để handle mouse down (bắt đầu drag hoặc click)
  const handleMouseDown = (dayName, dateStr, hour, percentage, event) => {
    if (percentage < 60) return;
    
    event.preventDefault();
    
    // Tính toán dateStr chính xác dựa trên currentWeekStart
    const startDate = new Date(currentWeekStart);
    const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayIndex = dayNames.indexOf(dayName);
    let correctDate = new Date(startDate);
    if (dayIndex === 0) { // CN
      correctDate.setDate(startDate.getDate() + 6);
    } else {
      correctDate.setDate(startDate.getDate() + (dayIndex - 1));
    }
    const correctYear = correctDate.getFullYear();
    const correctMonth = (correctDate.getMonth() + 1).toString().padStart(2, '0');
    const correctDay = correctDate.getDate().toString().padStart(2, '0');
    const correctDateStr = `${correctYear}-${correctMonth}-${correctDay}`;
    
    const slotKey = `${correctDateStr}_${hour}`;
    const slotInfo = { dayName, dateStr: correctDateStr, hour, percentage, key: slotKey };
    const isAlreadySelected = selectedTimeSlots.some(slot => slot.key === slotKey);
    
    // Thiết lập drag state
    setDragStart({ dayName, dateStr: correctDateStr, hour, percentage });
    setDragEnd({ dayName, dateStr: correctDateStr, hour, percentage });
    
    // Xác định drag mode dựa trên trạng thái hiện tại của slot
    setDragMode(isAlreadySelected ? 'remove' : 'add');
    
    // Tạo selection tạm thời cho slot hiện tại
    const tempSelection = new Set([slotKey]);
    setSelectedCells(tempSelection);
  };

  // Function để handle mouse enter (khi drag qua)
  const handleMouseEnter = (dayName, dateStr, hour, percentage) => {
    if (!dragStart || percentage < 60) return;
    
    // Tính toán dateStr chính xác cho slot hiện tại dựa trên currentWeekStart
    const startDate = new Date(currentWeekStart);
    const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayIndex = dayNames.indexOf(dayName);
    let correctDate = new Date(startDate);
    if (dayIndex === 0) {
      correctDate.setDate(startDate.getDate() + 6);
    } else {
      correctDate.setDate(startDate.getDate() + (dayIndex - 1));
    }
    const correctYear = correctDate.getFullYear();
    const correctMonth = (correctDate.getMonth() + 1).toString().padStart(2, '0');
    const correctDay = correctDate.getDate().toString().padStart(2, '0');
    const correctDateStr = `${correctYear}-${correctMonth}-${correctDay}`;
    
    // Bắt đầu drag khi di chuyển đến ô khác
    if (dragStart.dayName !== dayName || dragStart.hour !== hour) {
    setIsDragging(true);
      setDragEnd({ dayName, dateStr: correctDateStr, hour, percentage });
      
      // Tính toán vùng chọn
      const range = calculateSlotRange(dragStart, { 
        dayName, 
        dateStr: correctDateStr, 
        hour, 
        percentage 
      });
      
      const newSelection = new Set(range.map(slot => slot.key));
      setSelectedCells(newSelection);
    }
  };

  // Function để handle mouse up (kết thúc drag)
  const handleMouseUp = () => {
    if (!dragStart) return;
    
    if (isDragging && dragEnd) {
      // Xử lý drag selection
      const range = calculateSlotRange(dragStart, dragEnd);
      
      if (dragMode === 'add') {
        // Thêm các slot trong range vào selection
        setSelectedTimeSlots(prev => {
          const existingKeys = new Set(prev.map(slot => slot.key));
          const newSlots = range.filter(slot => !existingKeys.has(slot.key));
          return [...prev, ...newSlots];
        });
      } else if (dragMode === 'remove') {
        // Xóa các slot trong range khỏi selection
        setSelectedTimeSlots(prev => {
          const rangeKeys = new Set(range.map(slot => slot.key));
          return prev.filter(slot => !rangeKeys.has(slot.key));
        });
      }
    } else if (!isDragging) {
      // Single click - toggle slot
      const startDate = new Date(currentWeekStart);
      const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayIndex = dayNames.indexOf(dragStart.dayName);
      let correctDate = new Date(startDate);
      if (dayIndex === 0) {
        correctDate.setDate(startDate.getDate() + 6);
      } else {
        correctDate.setDate(startDate.getDate() + (dayIndex - 1));
      }
      const correctYear = correctDate.getFullYear();
      const correctMonth = (correctDate.getMonth() + 1).toString().padStart(2, '0');
      const correctDay = correctDate.getDate().toString().padStart(2, '0');
      const correctDateStr = `${correctYear}-${correctMonth}-${correctDay}`;
      
      const slotKey = `${correctDateStr}_${dragStart.hour}`;
      const slotInfo = { 
        dayName: dragStart.dayName, 
        dateStr: correctDateStr, 
        hour: dragStart.hour, 
        percentage: dragStart.percentage, 
        key: slotKey 
      };
      
      setSelectedTimeSlots(prev => {
        const exists = prev.find(slot => slot.key === slotKey);
        if (exists) {
          return prev.filter(slot => slot.key !== slotKey);
        } else {
          return [...prev, slotInfo];
        }
      });
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDragMode(null);
    setSelectedCells(new Set());
  };

  // Function để tính toán range slots trong drag selection
  const calculateSlotRange = (start, end) => {
    const slots = [];
    const hoursArray = Array.from({ length: 16 }, (_, i) => `${7 + i}:00`);
    
    // Tạo map ngày để đảm bảo tính chính xác dựa trên currentWeekStart
    const dayToDateMap = {};
    const startDate = new Date(currentWeekStart); // Sử dụng tuần hiện tại
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayOfWeek = currentDate.getDay();
      const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = dayNames[dayOfWeek];
      dayToDateMap[dayName] = dateStr;
    }
    
    // Tìm thứ tự của các ngày
    const dayOrder = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
    const startDayIndex = dayOrder.indexOf(start.dayName);
    const endDayIndex = dayOrder.indexOf(end.dayName);
    
    const startHourIndex = hoursArray.indexOf(start.hour);
    const endHourIndex = hoursArray.indexOf(end.hour);
    
    // Đảm bảo start <= end
    const minDayIndex = Math.min(startDayIndex, endDayIndex);
    const maxDayIndex = Math.max(startDayIndex, endDayIndex);
    const minHourIndex = startDayIndex === endDayIndex ? Math.min(startHourIndex, endHourIndex) : 
                         (startDayIndex < endDayIndex ? startHourIndex : endHourIndex);
    const maxHourIndex = startDayIndex === endDayIndex ? Math.max(startHourIndex, endHourIndex) :
                         (startDayIndex < endDayIndex ? endHourIndex : startHourIndex);
    
    // Duyệt qua range và thêm slots khả dụng
    for (let dayIdx = minDayIndex; dayIdx <= maxDayIndex; dayIdx++) {
      const dayName = dayOrder[dayIdx];
      const dateStr = dayToDateMap[dayName]; // Sử dụng map chính xác
      
      const startHour = (dayIdx === minDayIndex) ? minHourIndex : 0;
      const endHour = (dayIdx === maxDayIndex) ? maxHourIndex : hoursArray.length - 1;
      
      for (let hourIdx = startHour; hourIdx <= endHour; hourIdx++) {
        const hour = hoursArray[hourIdx];
        
        // Lấy percentage từ availabilityGrid với dateStr chính xác
        const percentage = availabilityGrid[dayName]?.[dateStr]?.[hour] || 0;
        
        if (percentage >= 60 && dateStr) {
          const slotKey = `${dateStr}_${hour}`;
          slots.push({ dayName, dateStr, hour, percentage, key: slotKey });
        }
      }
    }
    
    return slots;
  };

  // Khi bấm nút tạo sự kiện
  const handleOpenCreateModal = async () => {
    // Lấy ngày bắt đầu và kết thúc tuần hiện tại
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay() + 1); // Thứ 2
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Chủ nhật
    const startYear = startDate.getFullYear();
    const startMonth = (startDate.getMonth() + 1).toString().padStart(2, '0');
    const startDay = startDate.getDate().toString().padStart(2, '0');
    const startStr = `${startYear}-${startMonth}-${startDay}`;
    
    const endYear = endDate.getFullYear();
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');
    const endStr = `${endYear}-${endMonth}-${endDay}`;

        // Lấy timeslots của tất cả thành viên nhóm (theo cách của GroupCalendar)
    try {
      console.log('🔍 Đang lấy timeslots tất cả thành viên nhóm:', groupId);
      const response = await timeslotService.getGroupTimeslots(groupId);
      console.log('📋 Response từ getGroupTimeslots:', response);
      
      if (response.success && response.data) {
        const groupTimeslots = response.data;
        console.log(`👥 Có ${groupTimeslots.length} thành viên với timeslots`);
        console.log('👥 EventInfo memberCount:', eventInfo.memberCount);
        console.log('👥 Sample timeslot data:', groupTimeslots.slice(0, 2));
        
        // Tạo availability grid cho bảng thời gian
        const grid = calculateAvailabilityGrid(groupTimeslots, eventInfo.memberCount);
        setAvailabilityGrid(grid);
        console.log('✅ Đã tạo availability grid:', JSON.stringify(grid, null, 2));
        
        // Vẫn tạo freeSlots để backup (nếu cần)
        const availableSlots = calculateAvailableSlots(groupTimeslots, eventInfo.memberCount);
        setFreeSlots(availableSlots);
        console.log('✅ Đã tạo', availableSlots.length, 'slots khả dụng từ timeslots thật');
      } else {
        console.log('⚠️ Không lấy được timeslots nhóm');
        setFreeSlots([]);
        setAvailabilityGrid({});
      }
      
    } catch (e) {
      console.error('❌ Lỗi khi lấy timeslots nhóm:', e.message);
      setFreeSlots([]);
      setAvailabilityGrid({});
    }

    // Chỉ kiểm tra cache đề xuất địa điểm khi mở modal (không tạo mới)
    try {
      console.log('🔍 Checking cache for suggestions...');
      const cachedSuggestions = await suggestionService.getCachedSuggestions(groupId);
      console.log('📋 Cached suggestions response:', cachedSuggestions);
      
      if (Array.isArray(cachedSuggestions) && cachedSuggestions.length > 0) {
        const processedSuggestions = cachedSuggestions.map(suggestion => ({
          id: suggestion.id || `place_${suggestion.name.replace(/\s+/g, '_')}`,
          name: suggestion.name,
          category: suggestion.category,
          matchRate: `${suggestion.matchRate}%`,
          address: suggestion.address,
          distance: suggestion.distance,
          priceRange: suggestion.priceRange,
          matchReasons: suggestion.matchReasons,
          openingHours: suggestion.openingHours,
          lat: suggestion.lat,
          lng: suggestion.lng
        }));
        
        setSuggestedPlaces(processedSuggestions);
        console.log('✅ Loaded', processedSuggestions.length, 'suggestions from cache');
      } else {
        console.log('⚠️ No cached suggestions available');
        setSuggestedPlaces([]);
      }
    } catch (error) {
      console.error('💥 Error checking cached suggestions:', error);
      setSuggestedPlaces([]);
    }

    // Debug state
    console.log('📊 Debug - freeSlots trước khi mở modal:', freeSlots.length, 'slots');
    console.log('📊 Detailed freeSlots:', freeSlots);
    
    // Reset form states trước khi mở modal
    setEventName('');
    setSelectedTimeSlots([]);
    setSelectedVenue('');
    setSelectedSuggestedPlace('');
    setVenueInputMode('manual');
    // Không reset suggestedPlaces nữa vì đã load cache
    
    setShowCreateModal(true);
  };

  // Function để load đề xuất địa điểm
  const handleLoadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    let countdownInterval = null;
    
    try {
      // Lấy thông tin nhóm để tính toán thời gian dự kiến
      const response = await getGroupById(groupId);
      let locationCount = 1; // Mặc định
      let preferenceCount = 3; // Mặc định
      
      if (response.success && response.data) {
        // Đếm số thành viên có địa chỉ
        locationCount = response.data.memberCount || 1;
        
        // Ước tính số sở thích (giả sử mỗi thành viên có 2-3 sở thích)
        preferenceCount = Math.max(3, Math.floor(locationCount * 2.5));
      }
      
      // Tính thời gian dự kiến dựa trên dữ liệu thực tế
      const timeEstimate = suggestionService.calculateEstimatedTime(locationCount, preferenceCount);
      const estimatedTime = timeEstimate.total;
      
      console.log('⏱️ Thời gian dự kiến:', {
        locationCount,
        preferenceCount,
        estimatedTime,
        breakdown: timeEstimate.breakdown
      });
      
      setSuggestionCountdown(estimatedTime);
      
      // Bắt đầu countdown
      countdownInterval = setInterval(() => {
        setSuggestionCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      console.log('🔍 Loading suggestions for group:', groupId);
      const suggestions = await suggestionService.generateSuggestions(groupId);
      console.log('📋 Suggestions response:', suggestions);
      
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        // Xử lý suggestions thật từ service
        const processedSuggestions = suggestions.map(suggestion => ({
          id: suggestion.id || `place_${suggestion.name.replace(/\s+/g, '_')}`,
          name: suggestion.name,
          category: suggestion.category,
          matchRate: `${suggestion.matchRate}%`,
          address: suggestion.address,
          distance: suggestion.distance,
          priceRange: suggestion.priceRange,
          matchReasons: suggestion.matchReasons,
          openingHours: suggestion.openingHours,
          lat: suggestion.lat,
          lng: suggestion.lng
        }));
        
        setSuggestedPlaces(processedSuggestions);
        console.log('✅ Loaded', processedSuggestions.length, 'suggestions');
      } else {
        console.log('⚠️ Không có suggestions nào được trả về');
        setSuggestedPlaces([]);
      }
    } catch (error) {
      console.error('💥 Error loading suggestions:', error);
      setSuggestedPlaces([]);
    } finally {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      setIsLoadingSuggestions(false);
      setSuggestionCountdown(0);
    }
  };

  // Handler cho location selection
  const handleLocationSelect = (locationData) => {
    setSelectedLocationData(locationData);
    // Cập nhật selectedVenue để tương thích với validation
    setSelectedVenue(locationData.name);
  };

  const handleManualLocationChange = (value) => {
    setManualLocationInput(value);
    setSelectedVenue(value);
    // Clear selected location data khi nhập tay
    setSelectedLocationData(null);
  };

  const handleMapLocationSelect = (locationData) => {
    setSelectedLocationData(locationData);
    setSelectedVenue(locationData.name);
    setShowMapModal(false);
  };

  const handleOpenMapModal = () => {
    setShowMapModal(true);
  };

  const handleCloseMapModal = () => {
    setShowMapModal(false);
    // Nếu đóng modal mà chưa chọn địa điểm nào, chuyển về tab manual
    if (!selectedLocationData) {
      setVenueInputMode('manual');
    }
  };

  const handleSuggestedPlaceSelect = (placeId) => {
    setSelectedSuggestedPlace(placeId);
    
    if (placeId) {
      // Tìm thông tin địa điểm từ danh sách đề xuất
      const selectedPlace = suggestedPlaces.find(place => place.id === placeId);
      if (selectedPlace) {
        // Cập nhật selectedLocationData với thông tin từ suggestion
        const locationData = {
          name: selectedPlace.name,
          fullAddress: selectedPlace.address,
          lat: selectedPlace.lat,
          lng: selectedPlace.lng,
          category: selectedPlace.category,
          type: 'suggestion',
          matchRate: selectedPlace.matchRate,
          distance: selectedPlace.distance,
          priceRange: selectedPlace.priceRange
        };
        
        setSelectedLocationData(locationData);
        setSelectedVenue(selectedPlace.name);
        
        console.log('✅ Selected suggested place:', selectedPlace);
      }
    } else {
      // Clear selection nếu chọn option trống
      setSelectedLocationData(null);
      setSelectedVenue('');
    }
  };

  // Function để reset form và đóng modal
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEventName('');
    setSelectedTimeSlots([]);
    setSelectedVenue('');
    setSelectedSuggestedPlace('');
    setVenueInputMode('manual');
    // Không xóa suggestedPlaces để giữ cache
    setIsDragging(false);
    setDragStart(null);
    setDragMode(null);
    setShowTimeDetails(false);
    // Reset location states
    setSelectedLocationData(null);
    setManualLocationInput('');
    setShowMapModal(false);
    // Reset error states
    setShowCreateError(false);
    setCreateErrorMessage('');
    // Reset edit mode
    setIsEditMode(false);
  };

  // Validation form tạo sự kiện
  const validateCreateEventForm = () => {
    if (!eventName.trim()) {
      setCreateErrorMessage('Vui lòng nhập tên sự kiện');
      return false;
    }
    // Thời gian và địa điểm không bắt buộc theo yêu cầu mới
    return true;
  };

  // Xử lý tạo/cập nhật sự kiện
  const handleCreateEvent = async () => {
    // Validate form
    if (!validateCreateEventForm()) {
      setShowCreateError(true);
      setTimeout(() => setShowCreateError(false), 3000);
      return;
    }

    setIsCreatingEvent(true);
    
    try {
      // Xử lý thời gian
      let startTime = null;
      let endTime = null;
      let timeDisplay = 'Chưa xác định thời gian';
      
      if (selectedTimeSlots.length > 0) {
        // Lấy slot đầu tiên và cuối cùng để tạo khoảng thời gian
        const firstSlot = selectedTimeSlots[0];
        const lastSlot = selectedTimeSlots[selectedTimeSlots.length - 1];
        
        // Lấy ngày chính xác từ slot đầu tiên 
        const eventDate = firstSlot.dateStr; // Đã là format YYYY-MM-DD chính xác
        
        // Tạo thời gian bắt đầu từ slot đầu tiên
        const startHour = parseInt(firstSlot.hour.split(':')[0]);
        const startMinute = parseInt(firstSlot.hour.split(':')[1] || 0);
        
        // Tạo thời gian kết thúc từ slot cuối cùng + 1 giờ
        const lastSlotHour = parseInt(lastSlot.hour.split(':')[0]);
        const lastSlotMinute = parseInt(lastSlot.hour.split(':')[1] || 0);
        const endHour = lastSlotHour + 1;
        const endMinute = lastSlotMinute;
        
        // Format thành MySQL datetime (YYYY-MM-DD HH:MM:SS)
        startTime = `${eventDate} ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;
        endTime = `${eventDate} ${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`;
        
        // Tạo timeDisplay cho nhiều ngày
        timeDisplay = formatMultiDayTimeDisplay(selectedTimeSlots);
        
        // Debug log để kiểm tra thời gian được tạo
        console.log('🕒 Debug thời gian được tạo:', {
          eventDate,
          firstSlot: { dayName: firstSlot.dayName, dateStr: firstSlot.dateStr, hour: firstSlot.hour },
          lastSlot: { dayName: lastSlot.dayName, dateStr: lastSlot.dateStr, hour: lastSlot.hour },
          startHour, startMinute, 
          lastSlotHour, lastSlotMinute,
          endHour, endMinute,
          startTime, endTime,
          selectedSlotsCount: selectedTimeSlots.length
        });
      }
      
      // Xử lý địa điểm
      let venue = '';  // Khởi tạo rỗng thay vì 'Chưa xác định địa điểm'
      let locationInfo = null;
      
      if (venueInputMode === 'manual') {
        if (selectedLocationData) {
          // Sử dụng data từ autocomplete
          venue = selectedLocationData.fullAddress || selectedLocationData.name;
          locationInfo = {
            name: selectedLocationData.name,
            address: selectedLocationData.fullAddress,
            lat: selectedLocationData.lat,
            lng: selectedLocationData.lng,
            category: selectedLocationData.category || 'Địa điểm',
            type: selectedLocationData.type
          };
        } else if (selectedVenue.trim()) {
          // Fallback nếu chỉ có text
        venue = selectedVenue.trim();
        }
      } else if (venueInputMode === 'map' && selectedLocationData) {
        // Sử dụng data từ map picker
        venue = selectedLocationData.fullAddress || selectedLocationData.name;
        locationInfo = {
          name: selectedLocationData.name,
          address: selectedLocationData.fullAddress,
          lat: selectedLocationData.lat,
          lng: selectedLocationData.lng,
          category: selectedLocationData.category || 'Địa điểm',
          type: selectedLocationData.type
        };
      } else if (venueInputMode === 'suggestion' && selectedLocationData && selectedLocationData.type === 'suggestion') {
        // Sử dụng data từ suggestion đã chọn
        venue = selectedLocationData.fullAddress || selectedLocationData.name;
        locationInfo = {
          name: selectedLocationData.name,
          address: selectedLocationData.fullAddress,
          lat: selectedLocationData.lat,
          lng: selectedLocationData.lng,
          category: selectedLocationData.category || 'Địa điểm',
          type: selectedLocationData.type,
          matchRate: selectedLocationData.matchRate,
          distance: selectedLocationData.distance,
          priceRange: selectedLocationData.priceRange
        };
      }

      // Tạo timeslots JSON từ selectedTimeSlots
      let timeslotsData = null;
      if (selectedTimeSlots.length > 0) {
        timeslotsData = {
          type: selectedTimeSlots.length === 1 ? 'single' : 'multiple',
          slots: selectedTimeSlots.map(slot => ({
            date: slot.dateStr,
            start_time: slot.hour,
            end_time: calculateEndTimeFromSlot(slot.hour), // Tính end_time từ slot
            day_name: slot.dayName,
            percentage: slot.percentage
          }))
        };

      }

      // Kiểm tra xem có phải multi-day event không
      const uniqueDates = new Set(selectedTimeSlots.map(slot => slot.dateStr));
      const isMultiDay = selectedTimeSlots.length > 1 && uniqueDates.size > 1;
      


      // Tạo dữ liệu sự kiện cho API
      const eventData = {
        group_id: parseInt(groupId),
        name: eventName.trim(),
          // Chỉ set start_time/end_time cho single-day events
          // Multi-day events sẽ có start_time/end_time = null vì không thể lưu chính xác
          start_time: isMultiDay ? null : startTime,
          end_time: isMultiDay ? null : endTime,
          // Venue: null nếu trống, ngược lại lưu giá trị
          venue: !venue || venue.trim() === '' ? null : venue.trim(),
          status: 'planned', // Trạng thái mặc định
          timeslots: timeslotsData,
          // Lưu match_rate nếu có từ suggestion
          match_rate: locationInfo && locationInfo.matchRate ? 
            parseInt(locationInfo.matchRate.replace('%', '')) : null
        };

      let response;
      
      if (isEditMode) {
        // Cập nhật sự kiện
        eventData.event_id = currentEventId;
        response = await updateEvent(currentEventId, eventData);
      } else {
        // Tạo sự kiện mới
        response = await createEvent(eventData);
      }
      
      if (response.success) {
        // Cập nhật thông tin sự kiện trong state
        const newEventDetails = {
          name: eventName.trim(),
          location: !venue || venue.trim() === '' ? 'Chưa xác định địa điểm' : venue.trim(),
          time: timeDisplay,
          locationType: locationInfo ? locationInfo.category : 'Chưa xác định',
          matchRate: locationInfo ? locationInfo.matchRate : '0%',
          bookingStatus: 'Chưa đặt',
          notificationStatus: 'Chưa thông báo',
          attendeeCount: Math.max(eventInfo.memberCount || 0, 1),
          // Áp dụng logic multi-day cho state cũng
          start_time: isMultiDay ? null : startTime,
          end_time: isMultiDay ? null : endTime,
          event_id: response.data?.event_id || response.data?.id || currentEventId
        };

        setEventInfo(prev => ({
          ...prev,
          eventDetails: newEventDetails
        }));

        // Lưu event ID để có thể xóa (chỉ khi tạo mới)
        if (!isEditMode && (response.data?.event_id || response.data?.id)) {
          setCurrentEventId(response.data.event_id || response.data.id);
        }

        // Nếu là edit mode, reload event data để cập nhật UI
        if (isEditMode) {
          // Reload event data từ database
          try {
            const eventResponse = await getEventsByGroupId(groupId);
            if (eventResponse.success && eventResponse.data.length > 0) {
              const updatedEvent = eventResponse.data.find(event => event.event_id === currentEventId);
              if (updatedEvent) {
                // Format thời gian - ưu tiên JSON timeslots
                let formattedTime = 'Chưa xác định thời gian';

                if (updatedEvent.timeslots) {
                  // Sử dụng JSON timeslots nếu có
                  try {
                    // Kiểm tra xem timeslots đã là object hay string
                    const timeslots = typeof updatedEvent.timeslots === 'string' 
                      ? JSON.parse(updatedEvent.timeslots) 
                      : updatedEvent.timeslots;
                    formattedTime = formatTimeslotsDisplay(timeslots);
                  } catch (error) {
                    console.error('❌ Lỗi parse timeslots JSON:', error);
                    // Fallback về cách cũ
                    formattedTime = formatLegacyTime(updatedEvent.start_time, updatedEvent.end_time);
                  }
                } else if (updatedEvent.start_time && updatedEvent.end_time) {
                  // Fallback về cách cũ nếu không có JSON
                  formattedTime = formatLegacyTime(updatedEvent.start_time, updatedEvent.end_time);
                }

                const updatedEventDetails = {
                  name: updatedEvent.name,
                  location: updatedEvent.venue || 'Chưa xác định địa điểm',
                  time: formattedTime,
                  locationType: 'Địa điểm',
                  matchRate: updatedEvent.match_rate ? `${updatedEvent.match_rate}%` : '0%',
                  bookingStatus: 'Chưa đặt',
                  notificationStatus: updatedEvent.notification_status === 'sent' ? 'Đã thông báo' : 'Chưa thông báo',
                  attendeeCount: Math.max(updatedEvent.participant_count || 0, 1),
                  start_time: updatedEvent.start_time,
                  end_time: updatedEvent.end_time,
                  // Include timeslots để có thể parse khi edit
                  timeslots: updatedEvent.timeslots,
                  event_id: updatedEvent.event_id
                };
                
                setEventInfo(prev => ({
                  ...prev,
                  eventDetails: updatedEventDetails
                }));
              }
            }
          } catch (error) {
            console.error('❌ Lỗi khi reload event data:', error);
          }
        }

        // Đóng modal và reset form
        closeCreateModal();
        
        // Hiển thị thông báo thành công
        setShowCreateSuccess(true);
        
        // Ẩn thông báo sau 5 giây
        setTimeout(() => setShowCreateSuccess(false), 5000);
      } else {
        throw new Error(response.message || (isEditMode ? 'Không thể cập nhật sự kiện' : 'Không thể tạo sự kiện'));
      }
    } catch (error) {
      console.error(isEditMode ? '❌ Lỗi khi cập nhật sự kiện:' : '❌ Lỗi khi tạo sự kiện:', error);
      setCreateErrorMessage(error.message || (isEditMode ? 'Có lỗi xảy ra khi cập nhật sự kiện' : 'Có lỗi xảy ra khi tạo sự kiện'));
      setShowCreateError(true);
      setTimeout(() => setShowCreateError(false), 5000);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}      <GroupHeader 
        groupName={eventInfo.name || 'Đang tải...'}
        memberCount={eventInfo.memberCount || 0}
        showBackToGroups={true}
        isLeader={isUserLeader}
      />
      
      {/* Main Content */}
      <LeaderLayout rightButtons={rightButtons} activePage="Sự kiện">
        {/* Notification đặt chỗ thành công */}
        {showBookingSuccess && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiOutlineCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 font-medium">
                  Đặt chỗ thành công! Thông tin đã được gửi đến nơi kinh doanh.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification tạo/cập nhật sự kiện thành công */}
        {showCreateSuccess && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiOutlineCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 font-medium">
                  {isEditMode ? 'Cập nhật sự kiện thành công!' : 'Tạo sự kiện thành công!'} Sự kiện đã được lưu vào hệ thống.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification gửi thông báo thành công */}
        {showNotifySuccess && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiOutlineCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 font-medium">
                  Đã gửi email thông báo sự kiện đến tất cả thành viên nhóm thành công!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification lỗi gửi thông báo */}
        {showNotifyError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-red-500">✕</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 font-medium">
                  {notifyErrorMessage}
                </p>
              </div>
            </div>
          </div>
        )}



        {/* Các nút hành động */}
        <div className={`grid gap-3 p-4 ${isUserLeader ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <button 
            className={`bg-purple-300 text-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${eventInfo.eventDetails?.name ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-400'}`}
            onClick={() => {
              if (!eventInfo.eventDetails?.name) handleOpenCreateModal();
            }}
            disabled={!!eventInfo.eventDetails?.name}
          >
            Tạo sự kiện
          </button>
          <button 
            className={`bg-purple-300 text-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${!eventInfo.eventDetails?.name ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-400'}`}
            onClick={handleEditEvent}
            disabled={!eventInfo.eventDetails?.name}
          >
            Chỉnh sửa sự kiện
          </button>
          <button 
            className={`bg-purple-300 text-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${!eventInfo.eventDetails?.name || isNotifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-400'}`}
            onClick={handleNotifyEvent}
            disabled={!eventInfo.eventDetails?.name || isNotifying}
          >
            {isNotifying ? 'Đang gửi...' : 'Thông báo sự kiện'}
          </button>
          <button 
            className={`bg-purple-300 text-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${!eventInfo.eventDetails?.name ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-400'}`}
            onClick={handleBookingContact}
            disabled={!eventInfo.eventDetails?.name}
          >
            Liên hệ đặt chỗ
          </button>
        </div>

        {/* Thông tin sự kiện */}
        {eventInfo.eventDetails?.name ? (
          <Event
            variant="leader"
            eventDetails={eventInfo.eventDetails || {}}
            className="mt-4"
            onDeleteEvent={handleDeleteEvent}
            showDeleteButton={isUserLeader && currentEventId}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Nhóm bạn chưa có sự kiện nào, hãy tạo sự kiện cho nhóm.</h3>
          </div>
        )}







        {/* Modal tạo/chỉnh sửa sự kiện */}
        <Modal isOpen={showCreateModal} onClose={closeCreateModal} maxWidth="max-w-4xl">
          <div className="p-6 w-full">
            <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</h2>
            
            {/* Form tạo sự kiện */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Tên sự kiện <span className="text-red-500">*</span></label>
              <div className="relative">
              <input 
                type="text" 
                  className={`w-full border rounded px-3 py-2 ${showCreateError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                value={eventName} 
                onChange={e => setEventName(e.target.value)}
                placeholder="Nhập tên sự kiện..."
              />
                {/* Thông báo lỗi bên cạnh input */}
                {showCreateError && (
                  <div className="absolute left-full top-0 ml-3 w-64 bg-red-50 border border-red-200 p-3 rounded-md shadow-lg animate-fade-in z-50">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-4 w-4 text-red-500">⚠</div>
                      </div>
                      <div className="ml-2 flex-1">
                        <p className="text-xs text-red-800 font-medium">
                          {createErrorMessage}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCreateError(false)}
                        className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* Arrow pointing to input */}
                    <div className="absolute left-0 top-3 transform -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-red-200"></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Chọn thời gian
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Những khoảng thời gian rảnh chung của nhóm (≥60% thành viên rảnh).
              </p>
              
              {/* Điều hướng tuần */}
              <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
                <button
                  onClick={goToPreviousWeek}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Tuần trước
                </button>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">
                    {(() => {
                      const endDate = new Date(currentWeekStart);
                      endDate.setDate(currentWeekStart.getDate() + 6);
                      return `${currentWeekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
                    })()}
                  </div>
                  <button
                    onClick={goToCurrentWeek}
                    className="text-xs text-purple-600 hover:text-purple-800 underline mt-1"
                  >
                    Về tuần hiện tại
                  </button>
                      </div>
                
                <button
                  onClick={goToNextWeek}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
                >
                  Tuần sau
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                  </div>
              
              {/* Container cho bảng và overlay */}
              <div className="relative">
              {/* Bảng thời gian availability */}
              <div className="border rounded max-h-80 overflow-y-auto">
                <div className="p-2 text-xs">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>≥75%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-300 rounded"></div>
                      <span>60-74%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      <span>&lt;60%</span>
                    </div>
                  </div>
                  
                  {Object.keys(availabilityGrid).length > 0 ? (
                    <div className="overflow-x-auto border-2 border-black rounded-lg">
                      <table className="min-w-full text-xs border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 p-1 bg-gray-50 text-left font-medium min-w-12">Giờ</th>
                            {(() => {
                              // Tạo tuần hiện tại
                              const weekDays = [];
                              const startDate = new Date(currentWeekStart);
                              
                              for (let i = 0; i < 7; i++) {
                                const currentDate = new Date(startDate);
                                currentDate.setDate(startDate.getDate() + i);
                                const year = currentDate.getFullYear();
                                const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                                const day = currentDate.getDate().toString().padStart(2, '0');
                                const dateStr = `${year}-${month}-${day}`;
                                const dayOfWeek = currentDate.getDay();
                                const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                const dayName = dayNames[dayOfWeek];
                                const dateDisplay = currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                                
                                weekDays.push({
                                  dayName,
                                  dateStr,
                                  dateDisplay
                                });
                              }
                              
                              return weekDays.map(day => (
                                <th key={day.dateStr} className="border border-gray-300 p-1 bg-gray-50 text-center font-medium min-w-14">
                                  <div className="font-semibold">{day.dayName}</div>
                                  <div className="text-xs text-gray-500">{day.dateDisplay}</div>
                                </th>
                              ));
                            })()}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 16 }, (_, i) => `${7 + i}:00`).map(hour => (
                            <tr key={hour}>
                              <td className="border border-gray-300 p-1 bg-gray-50 font-medium">{hour}</td>
                              {(() => {
                                // Tạo tuần hiện tại
                                const weekDays = [];
                                const startDate = new Date(currentWeekStart);
                                
                                for (let i = 0; i < 7; i++) {
                                  const currentDate = new Date(startDate);
                                  currentDate.setDate(startDate.getDate() + i);
                                  const year = currentDate.getFullYear();
                                  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
                                  const day = currentDate.getDate().toString().padStart(2, '0');
                                  const dateStr = `${year}-${month}-${day}`;
                                  const dayOfWeek = currentDate.getDay();
                                  const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                  const dayName = dayNames[dayOfWeek];
                                  
                                  weekDays.push({
                                    dayName,
                                    dateStr
                                  });
                                }
                                
                                return weekDays.map(day => {
                                  const percentage = availabilityGrid[day.dayName]?.[day.dateStr]?.[hour] || 0;
                                  
                                  // Debug log để kiểm tra data
                                  if (hour === '7:00' && day.dayName === 'Thứ 2') {
                                    console.log(`🐛 Debug - ${day.dayName} ${day.dateStr} ${hour}:`, {
                                      dayName: day.dayName,
                                      dateStr: day.dateStr,
                                      hour,
                                      percentage,
                                      availabilityGrid: availabilityGrid[day.dayName],
                                      hasGridData: !!availabilityGrid[day.dayName]?.[day.dateStr],
                                      selectedTimeSlots: selectedTimeSlots.length,
                                      slotKey: `${day.dateStr}_${hour}`,
                                      isSelected: selectedTimeSlots.some(slot => slot.key === `${day.dateStr}_${hour}`)
                                    });
                                  }
                                  
                                  const getCellColor = (percent) => {
                                    if (percent >= 75) return 'bg-green-500';
                                    if (percent >= 60) return 'bg-green-300';
                                    return 'bg-gray-200';
                                  };
                                  
                                  const isClickable = percentage >= 60;
                                  const slotKey = `${day.dateStr}_${hour}`;
                                  const isSelected = selectedTimeSlots.some(slot => slot.key === slotKey);
                                  const isInDragSelection = selectedCells.has(slotKey);
                                  
                                  // Xác định màu nền cho ô
                                  let cellClassName = getCellColor(percentage);
                                  let extraClasses = '';
                                  
                                  if (isInDragSelection && isDragging) {
                                    if (dragMode === 'add') {
                                      // Khi đang chọn: viền tím bên trong
                                      extraClasses = 'ring-2 ring-purple-500 ring-inset';
                                    } else {
                                      // Khi đang xóa: màu đỏ với viền đỏ bên trong
                                      cellClassName = 'bg-red-300';
                                      extraClasses = 'ring-2 ring-red-500 ring-inset';
                                    }
                                  }
                                  
                                  return (
                                    <td 
                                      key={`${day.dateStr}-${hour}`}
                                      className={`border border-gray-300 p-1 text-center ${cellClassName} ${
                                        isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                                      } ${isSelected && !isInDragSelection ? 'ring-2 ring-purple-500 ring-inset' : ''} ${
                                        extraClasses
                                      } select-none`}
                                      onMouseDown={(e) => handleMouseDown(day.dayName, day.dateStr, hour, percentage, e)}
                                      onMouseEnter={() => handleMouseEnter(day.dayName, day.dateStr, hour, percentage)}
                                      onMouseUp={handleMouseUp}
                                      title={`${hour} - ${day.dayName} (${day.dateStr}) - ${percentage}% khả dụng${isClickable ? '\nClick để chọn/bỏ chọn, kéo thả để chọn nhiều ô' : ''}`}
                                    >
                                      <span className="text-white font-medium text-xs pointer-events-none">
                                        {percentage > 0 ? `${percentage}%` : ''}
                                      </span>
                                    </td>
                                  );
                                });
                              })()}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Đang tải dữ liệu thời gian...
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-600 mt-2 space-y-1">
                    <p>• Click vào ô có màu xanh (≥60%) để chọn/bỏ chọn thời gian</p>
                    <p>• Kéo thả từ ô chưa chọn để chọn nhiều ô liên tiếp</p>
                    <p>• Kéo thả từ ô đã chọn để bỏ chọn nhiều ô liên tiếp</p>
                    <p>• Màu xanh nhạt: đang chọn, màu đỏ nhạt: đang bỏ chọn</p>
                  </div>
                </div>
                
                {/* Overlay thông báo slots đã chọn - bên phải bảng */}
                {selectedTimeSlots.length > 0 && (
                  <div className="absolute left-full top-0 ml-3 w-80 bg-purple-50 border border-purple-200 p-3 rounded-md shadow-lg animate-fade-in z-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-purple-700 font-medium">
                        ✓ Đã chọn {selectedTimeSlots.length} khung thời gian
                      </div>
                      <button
                        type="button"
                        className="text-purple-400 hover:text-purple-600"
                        onClick={() => setSelectedTimeSlots([])}
                        title="Xóa tất cả"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Hiển thị slots đã chọn */}
                    <div className="text-xs text-purple-600">
                      {selectedTimeSlots.length === 1 && (
                        <div>
                          {selectedTimeSlots[0].dayName} {selectedTimeSlots[0].hour}
                        </div>
                      )}
                      {selectedTimeSlots.length > 1 && (
                        <div>
                          <div className="mb-1">
                            Từ {selectedTimeSlots[0].dayName} {selectedTimeSlots[0].hour} 
                            + {selectedTimeSlots.length - 1} khung giờ khác
                          </div>
                          {showTimeDetails && (
                            <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-purple-200">
                              {selectedTimeSlots.map(slot => (
                                <div key={slot.key} className="flex items-center justify-between bg-white px-2 py-1 rounded text-xs">
                                  <span>{slot.dayName} {slot.hour}</span>
                                  <span className="text-purple-500">{slot.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            type="button"
                            className="text-xs text-purple-600 hover:text-purple-800 underline mt-1"
                            onClick={() => setShowTimeDetails(!showTimeDetails)}
                          >
                            {showTimeDetails ? 'Thu gọn' : 'Chi tiết'}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Arrow pointing to table */}
                    <div className="absolute left-0 top-3 transform -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-purple-200"></div>
                  </div>
                )}
              </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block font-medium mb-1">
                Chọn địa điểm
              </label>
              
              {/* Tabs cho các cách chọn địa điểm */}
              <div className="flex border-b mb-3">
                <button
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    venueInputMode === 'manual' 
                      ? 'border-purple-500 text-purple-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setVenueInputMode('manual')}
                >
                  Địa điểm
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    venueInputMode === 'suggestion' 
                      ? 'border-purple-500 text-purple-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setVenueInputMode('suggestion')}
                >
                  Từ đề xuất ({suggestedPlaces.length})
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    venueInputMode === 'map' 
                      ? 'border-purple-500 text-purple-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => {
                    setVenueInputMode('map');
                    setShowMapModal(true);
                  }}
                >
                  Chọn trên bản đồ
                </button>
              </div>
              
              {/* Nội dung theo tab */}
              {venueInputMode === 'manual' && (
                <div>
                  <LocationAutocomplete
                    value={manualLocationInput}
                    onChange={handleManualLocationChange}
                    onSelect={handleLocationSelect}
                    placeholder="Nhập tên địa điểm..."
                    className="border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  {selectedLocationData && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                      <div className="font-medium text-blue-900">{selectedLocationData.name}</div>
                      <div className="text-blue-700 text-xs">{selectedLocationData.fullAddress}</div>
                    </div>
                  )}
                </div>
              )}
              
              {venueInputMode === 'suggestion' && (
                <div>
                  {suggestedPlaces.length === 0 ? (
                    <div className="text-center py-4 border rounded bg-gray-50">
                      <p className="text-gray-600 mb-3">Chưa có đề xuất địa điểm nào</p>
                      <button
                        className={`px-4 py-2 rounded transition-colors ${
                          isLoadingSuggestions 
                            ? 'bg-gray-400 cursor-not-allowed text-white' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                        onClick={handleLoadSuggestions}
                        disabled={isLoadingSuggestions}
                      >
                        {isLoadingSuggestions ? `Đang tạo đề xuất... (${suggestionCountdown}s)` : 'Đề xuất'}
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Hệ thống sẽ tạo đề xuất mới dựa trên sở thích và vị trí của nhóm
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-green-600">
                          Có {suggestedPlaces.length} địa điểm được đề xuất
                        </span>
                        <button
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            isLoadingSuggestions 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                          }`}
                          onClick={handleLoadSuggestions}
                          disabled={isLoadingSuggestions}
                        >
                          {isLoadingSuggestions ? `Đang tạo mới... (${suggestionCountdown}s)` : 'Đề xuất'}
                        </button>
                      </div>
                      <select 
                        className="w-full border rounded px-3 py-2" 
                        value={selectedSuggestedPlace} 
                        onChange={e => handleSuggestedPlaceSelect(e.target.value)}
                      >
                        <option value="">
                          -- Chọn địa điểm từ đề xuất --
                        </option>
                {suggestedPlaces.map(place => (
                          <option key={place.id} value={place.id}>
                            {place.name} {place.matchRate && `(${place.matchRate} phù hợp)`}
                          </option>
                ))}
              </select>
                      {selectedLocationData && selectedLocationData.type === 'suggestion' && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                          <div className="font-medium text-green-900">{selectedLocationData.name}</div>
                          <div className="text-green-700 text-xs">{selectedLocationData.fullAddress}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {venueInputMode === 'map' && (
                <div>
                  {selectedLocationData ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <div className="text-green-600 mt-0.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-green-800">{selectedLocationData.name}</div>
                            <div className="text-sm text-green-600 mt-1">{selectedLocationData.fullAddress}</div>
                            {selectedLocationData.lat && selectedLocationData.lng && (
                              <div className="text-xs text-green-500 mt-1">
                                Tọa độ: {selectedLocationData.lat.toFixed(6)}, {selectedLocationData.lng.toFixed(6)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleOpenMapModal}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Thay đổi địa điểm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLocationData(null);
                              setSelectedVenue('');
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Xóa địa điểm đã chọn"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-sm">Bản đồ sẽ mở để bạn chọn địa điểm</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors" 
                onClick={closeCreateModal}
                disabled={isCreatingEvent}
              >
                Hủy
              </button>
              <button 
                className={`px-4 py-2 rounded text-white transition-colors ${
                  isCreatingEvent 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                onClick={handleCreateEvent}
                disabled={isCreatingEvent}
              >
                {isCreatingEvent ? (isEditMode ? 'Đang cập nhật...' : 'Đang tạo...') : (isEditMode ? 'Cập nhật sự kiện' : 'Tạo sự kiện')}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal chọn địa điểm trên bản đồ */}
        <MapPickerModal
          isOpen={showMapModal}
          onClose={handleCloseMapModal}
          onLocationSelect={handleMapLocationSelect}
          initialLocation={selectedLocationData}
          title="Chọn địa điểm trên bản đồ"
        />

        {/* Modal cảnh báo chỉnh sửa sự kiện đang diễn ra */}
        <Modal isOpen={showEditWarning} onClose={() => setShowEditWarning(false)}>
          <div className="p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-orange-600">Cảnh báo</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Sự kiện đang diễn ra. Việc chỉnh sửa có thể ảnh hưởng đến người tham gia.
              </p>
              
              <div className="bg-orange-50 p-3 rounded border border-orange-200">
                <p className="font-medium text-orange-800">
                  Sự kiện: {eventInfo.eventDetails?.name}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  Thời gian: {eventInfo.eventDetails?.time}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  Địa điểm: {eventInfo.eventDetails?.location}
                </p>
              </div>
              
              <p className="text-sm text-orange-600 mt-3">
                ⚠️ Bạn có chắc chắn muốn tiếp tục chỉnh sửa?
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors" 
                onClick={() => setShowEditWarning(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                onClick={openEditModal}
              >
                Tiếp tục chỉnh sửa
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal xác nhận xóa sự kiện */}
        <Modal isOpen={showDeleteConfirm} onClose={handleCancelDelete}>
          <div className="p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận xóa sự kiện</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                {(() => {
                  const now = new Date();
                  const startTime = eventInfo.eventDetails?.start_time ? new Date(eventInfo.eventDetails.start_time) : null;
                  const endTime = eventInfo.eventDetails?.end_time ? new Date(eventInfo.eventDetails.end_time) : null;
                  
                  if (startTime && now < startTime) {
                    return 'Sự kiện chưa diễn ra, bạn có chắc chắn muốn xóa không?';
                  } else if (endTime && now < endTime) {
                    return 'Sự kiện chưa hoàn thành, bạn có chắc chắn muốn xóa không?';
                  } else if (startTime && now >= startTime && (!endTime || now >= endTime)) {
                    return 'Sự kiện đã hoàn thành, bạn có chắc chắn muốn xóa không?';
                  }
                  return 'Bạn có chắc chắn muốn xóa sự kiện này không?';
                })()}
              </p>
              
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-800">
                  Sự kiện: {eventInfo.eventDetails?.name || 'Không có tên'}
                </p>
                {eventInfo.eventDetails?.time && (
                  <p className="text-sm text-gray-600 mt-1">
                    Thời gian: {eventInfo.eventDetails.time}
                  </p>
                )}
                {eventInfo.eventDetails?.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    Địa điểm: {eventInfo.eventDetails.location}
                  </p>
                )}
              </div>
              
              <p className="text-sm text-red-600 mt-3">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors" 
                onClick={handleCancelDelete}
                disabled={isDeletingEvent}
              >
                Hủy
              </button>
              <button 
                className={`px-4 py-2 rounded text-white transition-colors ${
                  isDeletingEvent 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={handleConfirmDelete}
                disabled={isDeletingEvent}
              >
                {isDeletingEvent ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal quản lý đặt chỗ */}
        <Modal isOpen={showBookingManagement} onClose={() => setShowBookingManagement(false)} maxWidth="max-w-6xl">
          <div className="p-6 w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đặt chỗ</h2>
            
            {/* Tab navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveBookingTab('my-bookings')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeBookingTab === 'my-bookings'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <HiOutlineEye className="inline-block w-4 h-4 mr-2" />
                Đặt chỗ của tôi
              </button>
              <button
                onClick={() => setActiveBookingTab('new-booking')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeBookingTab === 'new-booking'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <HiOutlinePlus className="inline-block w-4 h-4 mr-2" />
                Đặt chỗ mới
              </button>
            </div>

            {/* Tab Content */}
            {activeBookingTab === 'my-bookings' && (
              <div>
                {bookingLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải danh sách đặt chỗ...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <HiOutlineClipboardList className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">Bạn chưa có đặt chỗ nào.</p>
                    <p className="text-gray-400 text-sm mt-2">Hãy chuyển sang tab "Đặt chỗ mới" để bắt đầu!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                            Sự kiện
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doanh nghiệp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số người
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thời gian
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Liên hệ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap w-32">
                              <div 
                                className="text-sm font-medium text-gray-900 truncate cursor-help"
                                title={booking.event_name || 'Không xác định'}
                              >
                                {booking.event_name || 'Không xác định'}
                              </div>
                              <div className="text-xs text-gray-500 truncate" title={`ID: ${booking.event_id || 'N/A'}`}>
                                ID: {booking.event_id || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.enterprise_name || 'Không xác định'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <HiOutlineUserGroup className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-900">
                                  {booking.number_of_people || 0} người
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking.booking_time || 'Chưa xác định'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(booking.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <HiOutlinePhone className="w-4 h-4 text-gray-400 mr-1" />
                                <a
                                  href={`tel:${booking.enterprise_phone || ''}`}
                                  className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                  {booking.enterprise_phone || 'Không có'}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditBooking(booking)}
                                  className={`p-1 rounded transition-colors ${
                                    booking.status === 'rejected' || booking.status === 'cancelled'
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-blue-600 hover:text-blue-800'
                                  }`}
                                  title={booking.status === 'rejected' || booking.status === 'cancelled' ? 'Không thể sửa đặt chỗ này' : 'Sửa đặt chỗ'}
                                  disabled={booking.status === 'rejected' || booking.status === 'cancelled'}
                                >
                                  <HiOutlinePencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking)}
                                  className={`p-1 rounded transition-colors ${
                                    booking.status === 'rejected' || booking.status === 'cancelled'
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-red-600 hover:text-red-800'
                                  }`}
                                  title={booking.status === 'rejected' || booking.status === 'cancelled' ? 'Đặt chỗ đã bị hủy' : 'Hủy đặt chỗ'}
                                  disabled={booking.status === 'rejected' || booking.status === 'cancelled'}
                                >
                                  <HiOutlineTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeBookingTab === 'new-booking' && (
              <div>
                {bookingLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải danh sách doanh nghiệp...</p>
                  </div>
                ) : enterprises.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <HiOutlineLocationMarker className="w-16 h-16 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">Không có doanh nghiệp nào.</p>
                    <p className="text-gray-400 text-sm mt-2">Vui lòng thử lại sau!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
                    {enterprises.map((enterprise) => (
                      <div key={enterprise.enterprise_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                              {enterprise.name}
                            </h4>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <HiOutlineTag className="w-4 h-4 mr-1" />
                              <span>{getEnterpriseTypeLabel(enterprise.enterprise_type)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <HiOutlinePhone className="w-4 h-4 mr-2" />
                            <a
                              href={`tel:${enterprise.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {enterprise.phone}
                            </a>
                          </div>
                          
                          <div className="flex items-start text-sm text-gray-600">
                            <HiOutlineLocationMarker className="w-4 h-4 mr-2 mt-0.5" />
                            <span className="line-clamp-2">{enterprise.address}</span>
                          </div>
                          
                          {enterprise.operating_hours && (
                            <div className="flex items-center text-sm text-gray-600">
                              <HiOutlineCalendar className="w-4 h-4 mr-2" />
                              <span>{enterprise.operating_hours}</span>
                            </div>
                          )}
                          
                          {enterprise.capacity && (
                            <div className="flex items-center text-sm text-gray-600">
                              <HiOutlineUserGroup className="w-4 h-4 mr-2" />
                              <span>Sức chứa: {enterprise.capacity} người</span>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleEnterpriseSelect(enterprise)}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                        >
                          <HiOutlinePlus className="w-4 h-4 mr-2" />
                          Đặt chỗ
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>

        {/* Modal xác nhận hủy booking */}
        <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)}>
          <div className="p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Xác nhận hủy đặt chỗ</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Bạn có chắc chắn muốn hủy đặt chỗ này không?
              </p>
              
              {selectedBooking && (
                <div className="bg-gray-50 p-4 rounded border">
                  <p className="font-medium text-gray-800">
                    Sự kiện: {selectedBooking.event_name || 'Không xác định'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Doanh nghiệp: {selectedBooking.enterprise_name || 'Không xác định'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Số người: {selectedBooking.number_of_people || 0} người
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Thời gian: {selectedBooking.booking_time || 'Chưa xác định'}
                  </p>
                </div>
              )}
              
              <p className="text-sm text-red-600 mt-3">
                ⚠️ Hành động này không thể hoàn tác!
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors" 
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelingBooking}
              >
                Hủy
              </button>
              <button 
                className={`px-4 py-2 rounded text-white transition-colors ${
                  isCancelingBooking 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={handleConfirmCancel}
                disabled={isCancelingBooking}
              >
                {isCancelingBooking ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal sửa booking */}
        <Modal isOpen={showEditBooking} onClose={() => setShowEditBooking(false)}>
          <div className="p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-600">Sửa đặt chỗ</h2>
            
            {editingBooking && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded border mb-4">
                  <p className="font-medium text-gray-800">
                    Sự kiện: {editingBooking.event_name || 'Không xác định'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Doanh nghiệp: {editingBooking.enterprise_name || 'Không xác định'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số người tham dự
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingBooking.attendee_count}
                    onChange={(e) => setEditingBooking({
                      ...editingBooking,
                      attendee_count: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian đặt chỗ
                  </label>
                  <input
                    type="text"
                    value={editingBooking.booking_time}
                    onChange={(e) => setEditingBooking({
                      ...editingBooking,
                      booking_time: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: 14:00 Thứ Hai, 20/01/2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={editingBooking.notes}
                    onChange={(e) => setEditingBooking({
                      ...editingBooking,
                      notes: e.target.value
                    })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Thêm ghi chú đặc biệt hoặc yêu cầu (nếu có)"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors" 
                    onClick={() => setShowEditBooking(false)}
                    disabled={isCancelingBooking}
                  >
                    Hủy
                  </button>
                  <button 
                    className={`px-4 py-2 rounded text-white transition-colors ${
                      isCancelingBooking 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={handleSaveEditBooking}
                    disabled={isCancelingBooking}
                  >
                    {isCancelingBooking ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Modal tùy chỉnh email */}
        <EmailCustomizationModal
          isOpen={showEmailModal}
          onClose={handleCloseEmailModal}
          onSend={handleSendCustomEmail}
          eventData={{
            name: eventInfo.eventDetails?.name,
            time: eventInfo.eventDetails?.time,
            venue: eventInfo.eventDetails?.location
          }}
          groupData={{
            name: eventInfo?.name
          }}
          isLoading={isNotifying}
        />
      </LeaderLayout>
    </div>
  );
};

export default EventManager;
