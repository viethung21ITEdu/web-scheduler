import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupHeader from '../../../../components/layoutPrimitives/GroupHeader';
import LeaderLayout from '../../../../components/layoutPrimitives/LeaderLayout';
import { getGroupById } from '../../../../services/groupService';
import bookingService from '../../../../services/bookingService';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUserGroup, HiOutlinePhone, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlinePlus, HiOutlineEye, HiOutlineTag } from 'react-icons/hi';
import { getEnterpriseTypeLabel } from '../../../../utils/enterpriseUtils';

const BookingManagement = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  // State để lưu thông tin nhóm
  const [groupInfo, setGroupInfo] = useState({
    name: '',
    memberCount: 0,
  });
  
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState('my-bookings'); // 'my-bookings' hoặc 'new-booking'
  
  // State cho danh sách đặt chỗ
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho enterprises
  const [enterprises, setEnterprises] = useState([]);

  // Lấy thông tin nhóm khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin nhóm
        const groupResponse = await getGroupById(groupId);
        if (groupResponse.success) {
          setGroupInfo(groupResponse.data);
        }
        
        // Lấy danh sách đặt chỗ
        await fetchMyBookings();
        
        // Lấy danh sách enterprises
        await fetchEnterprises();
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      }
    };

    fetchData();
  }, [groupId]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnterprises = async () => {
    try {
      const data = await bookingService.getEnterprises();
      setEnterprises(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách enterprises:', error);
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
    // Cần có eventId để đặt chỗ - có thể lấy từ event hiện tại của nhóm
    if (!groupInfo.currentEventId && !groupInfo.eventDetails?.event_id) {
      alert('Cần tạo sự kiện trước khi đặt chỗ. Vui lòng quay lại trang Sự kiện để tạo sự kiện mới.');
      return;
    }
    
    // Điều hướng đến trang đặt chỗ với thông tin enterprise
    navigate(`/groups/${groupId}/booking`, {
      state: {
        eventId: groupInfo.currentEventId || groupInfo.eventDetails?.event_id,
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

  // Các nút chức năng bên phải
  const rightButtons = [
    { label: 'Sự kiện', onClick: () => navigate(`/groups/${groupId}/event-manager`) },
    { label: 'Quản lý thời gian', onClick: () => navigate(`/groups/${groupId}/time-editor`) },
    { label: 'Quản lý vị trí và sở thích', onClick: () => navigate(`/groups/${groupId}/location-preference`) },
    { label: 'Lịch rảnh nhóm', onClick: () => navigate(`/groups/${groupId}/group-calendar`) },
    { label: 'Đề xuất địa điểm', onClick: () => navigate(`/groups/${groupId}/suggestion-list`) },
    { label: 'Liên hệ đặt chỗ', onClick: () => {} }, // Trang hiện tại
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <GroupHeader 
        groupName={groupInfo.name || 'Đang tải...'}
        memberCount={groupInfo.memberCount || 0}
        showBackToGroups={true}
        isLeader={true}
      />
      
      {/* Main Content */}
      <LeaderLayout rightButtons={rightButtons} activePage="Liên hệ đặt chỗ">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Header với tabs */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quản lý đặt chỗ</h2>
            
            {/* Tab navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'my-bookings'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <HiOutlineEye className="inline-block w-4 h-4 mr-2" />
                Đặt chỗ của tôi
              </button>
              <button
                onClick={() => setActiveTab('new-booking')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'new-booking'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <HiOutlinePlus className="inline-block w-4 h-4 mr-2" />
                Đặt chỗ mới
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'my-bookings' && (
            <div>
              {loading ? (
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.booking_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.event_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {booking.event_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.enterprise_name}
                              </div>
                              {booking.enterprise_phone && (
                                <div className="text-sm text-gray-500">
                                  {booking.enterprise_phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.number_of_people} người
                          </td>
                                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.booking_time || 'Chưa xác định'}
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {booking.enterprise_phone && (
                              <a 
                                href={`tel:${booking.enterprise_phone}`}
                                className="text-purple-600 hover:text-purple-800 font-medium"
                              >
                                Gọi điện
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'new-booking' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chọn doanh nghiệp để đặt chỗ</h3>
              
              {enterprises.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <HiOutlineLocationMarker className="w-16 h-16 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-lg">Không có doanh nghiệp nào để đặt chỗ.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enterprises.map((enterprise) => (
                    <div
                      key={enterprise.enterprise_id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEnterpriseSelect(enterprise)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{enterprise.name}</h4>
                          
                          {enterprise.enterprise_type && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Loại:</span> {enterprise.enterprise_type}
                            </p>
                          )}
                          
                          {enterprise.phone && (
                            <p className="text-sm text-gray-600 mb-1 flex items-center">
                              <HiOutlinePhone className="w-4 h-4 mr-1" />
                              {enterprise.phone}
                            </p>
                          )}
                          
                          {enterprise.address && (
                            <p className="text-sm text-gray-600 mb-1 flex items-center">
                              <HiOutlineLocationMarker className="w-4 h-4 mr-1" />
                              {enterprise.address}
                            </p>
                          )}
                          
                          {enterprise.opening_hours && (
                            <p className="text-sm text-gray-600 mb-1 flex items-center">
                              <HiOutlineCalendar className="w-4 h-4 mr-1" />
                              {enterprise.opening_hours}
                            </p>
                          )}
                          
                          {enterprise.capacity && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <HiOutlineUserGroup className="w-4 h-4 mr-1" />
                              Sức chứa: {enterprise.capacity} người
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors font-medium">
                          Chọn đặt chỗ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </LeaderLayout>
    </div>
  );
};

export default BookingManagement; 