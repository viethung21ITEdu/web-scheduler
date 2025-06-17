import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupHeader from '../../../../components/layoutPrimitives/GroupHeader';
import LeaderLayout from '../../../../components/layoutPrimitives/LeaderLayout';
import { getGroupById } from '../../../../services/groupService';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUserGroup, HiOutlineCheckCircle } from 'react-icons/hi';

const EventUpdate = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  // State để lưu thông tin nhóm và event
  const [groupInfo, setGroupInfo] = useState({
    name: '',
    memberCount: 0,
    eventDetails: {
      location: '',
      locationType: '',
      matchRate: '',
    }
  });
  const [eventInfo, setEventInfo] = useState({
    time: '',
  });
  
  // Store original event info for cancel functionality
  const [originalEventInfo, setOriginalEventInfo] = useState({
    time: '',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Lấy thông tin nhóm và đề xuất đã chọn khi component được mount
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await getGroupById(groupId);
        if (response.success) {
          setGroupInfo(response.data);
          // Lưu thông tin ban đầu để có thể khôi phục khi hủy
          const initialEventInfo = {
            time: response.data.eventDetails?.time || '',
          };
          setEventInfo(initialEventInfo);
          setOriginalEventInfo(initialEventInfo);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin nhóm:', error);
      }
    };

    fetchGroupData();
  }, [groupId]);
  
  // Xử lý khi người dùng nhập thông tin
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newEventInfo = {
      ...eventInfo,
      [name]: value
    };
    setEventInfo(newEventInfo);
    
    // Kiểm tra xem có sự thay đổi so với dữ liệu ban đầu không
    const isChanged = newEventInfo.time !== originalEventInfo.time;
    setHasChanges(isChanged);
    
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!eventInfo.time.trim()) {
      newErrors.time = 'Vui lòng nhập thời gian sự kiện';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi xác nhận chỉnh sửa sự kiện
  const handleConfirmUpdate = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hiển thị thông báo thành công
      setShowSuccess(true);
      
      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate(`/groups/${groupId}/event-manager`);
      }, 2000);
      
    } catch (error) {
      console.error('Lỗi khi cập nhật sự kiện:', error);
      setIsSubmitting(false);
    }
  };
  // Xử lý khi nhấn nút Hủy
  const handleCancel = () => {
    // Khôi phục lại dữ liệu ban đầu
    setEventInfo(originalEventInfo);
    setErrors({});
    setHasChanges(false);
  };

  // Xử lý khi nhấn nút Back
  const handleBack = () => {
    // Nếu có thay đổi, hiển thị xác nhận trước khi quay lại
    if (hasChanges) {
      const confirmBack = window.confirm('Bạn có thay đổi chưa được lưu. Bạn có chắc muốn quay lại không?');
      if (!confirmBack) {
        return;
      }
    }
    navigate(`/groups/${groupId}/event-manager`);
  };

  // Các nút chức năng bên phải
  const rightButtons = [
    { label: 'Sự kiện', onClick: () => navigate(`/groups/${groupId}/event-manager`) },
    { label: 'Quản lý thời gian', onClick: () => navigate(`/groups/${groupId}/time-editor`) },
    { label: 'Quản lý vị trí và sở thích', onClick: () => navigate(`/groups/${groupId}/location-preference`) },
    { label: 'Lịch rảnh nhóm', onClick: () => navigate(`/groups/${groupId}/group-calendar`) },
    { label: 'Đề xuất địa điểm', onClick: () => navigate(`/groups/${groupId}/suggestion-list`) },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <GroupHeader 
        groupName={groupInfo.name || 'Đang tải...'}
        memberCount={groupInfo.memberCount || 0}
        showBackToGroups={true}
        isLeader={true}
        onBack={handleBack}
      />
      
      <LeaderLayout rightButtons={rightButtons} activePage="Sự kiện">
        {/* Success notification */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm w-full animate-bounce-in">
              <div className="flex items-center justify-center text-green-500 mb-4">
                <HiOutlineCheckCircle className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Cập nhật sự kiện thành công!</h3>
              <p className="text-gray-600 text-center mb-6">
                Thông tin sự kiện đã được cập nhật. Bạn sẽ được chuyển hướng trong vài giây.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div className="bg-green-500 h-1.5 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Chỉnh sửa thông tin sự kiện</h2>
            <div className="flex space-x-4">
              <button 
                onClick={handleCancel}
                disabled={!hasChanges || isSubmitting}
                className={`flex items-center justify-center py-2 px-6 rounded-md transition-all font-medium ${
                  hasChanges && !isSubmitting
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Huỷ
              </button>
              <button 
                onClick={handleConfirmUpdate}
                disabled={!hasChanges || isSubmitting}
                className={`flex items-center justify-center bg-purple-500 py-2 px-6 rounded-md transition-all text-white font-medium ${
                  !hasChanges || isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-600'
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
                ) : 'Cập nhật sự kiện'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thông tin từ đề xuất */}
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="font-bold text-gray-800 mb-4">Thông tin từ đề xuất</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <HiOutlineLocationMarker className="text-purple-600 mr-2 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 text-sm block">Địa điểm</span>
                    <span className="font-medium">{groupInfo.eventDetails?.location || 'Chưa có thông tin'}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <HiOutlineUserGroup className="text-purple-600 mr-2 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 text-sm block">Loại địa điểm</span>
                    <span className="font-medium">{groupInfo.eventDetails?.locationType || 'Chưa có thông tin'}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <HiOutlineCheckCircle className="text-purple-600 mr-2 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 text-sm block">Tỉ lệ khớp sở thích</span>
                    <span className="font-medium">{groupInfo.eventDetails?.matchRate || 'Chưa có thông tin'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form chỉnh sửa sự kiện */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Thông tin sự kiện</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-2">
                    <HiOutlineCalendar className="mr-2 text-purple-600" />
                    <label className="text-gray-700 font-medium">Thời gian sự kiện</label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="time"
                      value={eventInfo.time}
                      onChange={handleInputChange}
                      className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-purple-300 focus:outline-none ${
                        errors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập thời gian sự kiện (vd: 15h30 ngày 20/06/2025)"
                    />
                    {errors.time && (
                      <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <HiOutlineUserGroup className="mr-2 text-purple-600" />
                    <label className="text-gray-700 font-medium">Số lượng người tham gia</label>
                  </div>
                  <div className="relative">
                    <div className="w-full p-3 bg-gray-50 border rounded-md text-gray-700">
                      {Math.max(groupInfo.eventDetails?.attendeeCount || 0, 1)} người đã xác nhận tham gia
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Số lượng người tham gia được cập nhật tự động khi thành viên xác nhận tham gia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LeaderLayout>
    </div>
  );
};

export default EventUpdate;