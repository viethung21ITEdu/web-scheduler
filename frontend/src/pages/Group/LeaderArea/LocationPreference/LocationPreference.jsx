import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GroupHeader from '../../../../components/layoutPrimitives/GroupHeader';
import LeaderLayout from '../../../../components/layoutPrimitives/LeaderLayout';
import { getGroupById } from '../../../../services/groupService';
import locationPreferenceService from '../../../../services/locationPreferenceService';
import AddressAutocomplete from '../../../../components/common/AddressAutocomplete';
import MapLocationPicker from '../../../../components/common/MapLocationPicker';

// Danh sách các sở thích có thể chọn
const preferenceOptions = [
  { id: 'cafe', label: 'Quán cà phê' },
  { id: 'restaurant', label: 'Quán ăn' },
  { id: 'park', label: 'Công viên' },
  { id: 'cinema', label: 'Rạp phim' },
  { id: 'mall', label: 'Trung tâm thương mại' },
  { id: 'library', label: 'Thư viện' },
];

const LocationPreference = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState({
    name: '',
    memberCount: 0,
  });

  // State cho vị trí và sở thích
  const [location, setLocation] = useState('');
  const [preferences, setPreferences] = useState({});
  const [otherPreference, setOtherPreference] = useState(''); // Tùy chọn khác

  // State để lưu trữ trạng thái ban đầu để phục hồi khi hủy
  const [originalLocation, setOriginalLocation] = useState('');
  const [originalPreferences, setOriginalPreferences] = useState({});
  const [originalOtherPreference, setOriginalOtherPreference] = useState('');

  // State để kiểm soát trạng thái chỉnh sửa
  const [hasChanges, setHasChanges] = useState(false);
  
  // State cho Map picker
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  // State cho GPS location
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Load dữ liệu từ backend
  const loadLocationPreferences = async () => {
    try {
      const response = await locationPreferenceService.getUserLocationPreferences(groupId);
      if (response.success) {
        const data = response.data;
        setLocation(data.location || '');
        setPreferences(data.preferences || {});
        setOtherPreference(data.other_preference || '');
        
        // Lưu trạng thái ban đầu
        setOriginalLocation(data.location || '');
        setOriginalPreferences({...(data.preferences || {})});
        setOriginalOtherPreference(data.other_preference || '');
      }
    } catch (error) {
      console.error('Lỗi khi load location preferences:', error);
      // Nếu lỗi, dùng dữ liệu trống
      setLocation('');
      setPreferences({});
      setOtherPreference('');
      setOriginalLocation('');
      setOriginalPreferences({});
      setOriginalOtherPreference('');
    }
  };

  // Lấy thông tin nhóm khi component được mount
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await getGroupById(groupId);
        if (response.success) {
          setGroupInfo({
            name: response.data.name,
            memberCount: response.data.memberCount
          });
          
          // Load location preferences từ backend
          await loadLocationPreferences();
        } else {
          console.error('Lỗi khi lấy thông tin nhóm:', response.message);
          alert('Không thể lấy thông tin nhóm. Vui lòng thử lại sau.');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin nhóm:', error);
        alert('Có lỗi xảy ra khi tải dữ liệu.');
      }
    };

    fetchGroupData();
  }, [groupId]);

  // Kiểm tra thay đổi khi location, preferences hoặc otherPreference thay đổi
  useEffect(() => {
    const locationChanged = location !== originalLocation;
    const otherPreferenceChanged = otherPreference !== originalOtherPreference;
    
    let preferencesChanged = false;
    // Kiểm tra xem có sự thay đổi nào trong preferences không
    preferenceOptions.forEach(option => {
      if (preferences[option.id] !== originalPreferences[option.id]) {
        preferencesChanged = true;
      }
    });
    
    setHasChanges(locationChanged || preferencesChanged || otherPreferenceChanged);
  }, [location, preferences, otherPreference, originalLocation, originalPreferences, originalOtherPreference]);

  // Xử lý thay đổi vị trí
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    // Clear error khi user nhập thủ công
    if (locationError) {
      setLocationError('');
    }
  };

  // Xử lý thay đổi sở thích
  const handlePreferenceChange = (id) => {
    setPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Xử lý khi chọn từ map
  const handleMapLocationSelect = (locationData) => {
    setLocation(locationData.address);
  };

  // Mở map picker
  const openMapPicker = () => {
    setIsMapOpen(true);
  };

  // Lấy vị trí hiện tại bằng GPS
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ GPS');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Sử dụng Reverse Geocoding để chuyển tọa độ thành địa chỉ
          const address = await reverseGeocode(latitude, longitude);
          
          if (address) {
            setLocation(address);
            setLocationError('');
          } else {
            setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            setLocationError('Không thể xác định địa chỉ, hiển thị tọa độ');
          }
        } catch (error) {
          console.error('Lỗi khi lấy địa chỉ:', error);
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setLocationError('Không thể xác định địa chỉ, hiển thị tọa độ');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Lỗi GPS:', error);
        let errorMessage = 'Không thể lấy vị trí hiện tại';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vui lòng cho phép truy cập vị trí';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không khả dụng';
            break;
          case error.TIMEOUT:
            errorMessage = 'Quá thời gian chờ lấy vị trí';
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 phút
      }
    );
  };

  // Reverse Geocoding sử dụng OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=vi`,
        {
          headers: {
            'User-Agent': 'GroupScheduleApp/1.0 (your-email@example.com)'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error('Lỗi reverse geocoding:', error);
      return null;
    }
  };

  // Xử lý khi nhấn nút Lưu
  const handleSave = async () => {
    try {
      const response = await locationPreferenceService.saveUserLocationPreferences(groupId, {
        location,
        preferences,
        otherPreference
      });
      
      if (response.success) {
        // Cập nhật trạng thái ban đầu để phản ánh các thay đổi đã lưu
        setOriginalLocation(location);
        setOriginalPreferences({...preferences});
        setOriginalOtherPreference(otherPreference);
        setHasChanges(false);
        
        alert('Đã lưu vị trí và sở thích thành công!');
      } else {
        alert(response.message || 'Không thể lưu dữ liệu');
      }
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại sau.');
    }
  };

  // Xử lý khi nhấn nút Hủy
  const handleCancel = () => {
    // Khôi phục trạng thái ban đầu
    setLocation(originalLocation);
    setPreferences({...originalPreferences});
    setOtherPreference(originalOtherPreference);
    setHasChanges(false);
    alert('Đã hủy các thay đổi!');
  };

  // Xử lý các hành động điều hướng  // Các nút chức năng bên phải
  const rightButtons = [
    { label: 'Sự kiện', onClick: () => navigate(`/groups/${groupId}/event-manager`) },
    { label: 'Quản lý thời gian', onClick: () => navigate(`/groups/${groupId}/time-editor`) },
    { label: 'Quản lý vị trí và sở thích', onClick: () => {} },
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
      />
      
      {/* Main Content */}
      <LeaderLayout rightButtons={rightButtons} activePage="Quản lý vị trí và sở thích">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="mb-4 pb-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-1 text-center">Chỉnh sửa vị trí và sở thích</h2>
            <p className="text-sm text-gray-600 text-center">Cập nhật thông tin để nhóm có thể lên kế hoạch phù hợp</p>
          </div>
          
          {/* Form sections */}
          <div className="space-y-8">
            {/* Vị trí */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                   Nhập vị trí
                </span>
              </label>
              <div className="space-y-3">
                {/* Input địa chỉ */}
                <div className="relative">
                  <AddressAutocomplete
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="Ví dụ: 29/8 Nguyễn Bỉnh Khiêm, KP Tân Hòa, phường Đông Hòa, Dĩ An, Bình Dương"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-gray-50"
                  />
                </div>
                
                {/* Các nút hành động */}
                <div className="flex gap-3">
                  <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className={`px-5 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px] ${
                      isGettingLocation 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 transform'
                    }`}
                    title="Lấy vị trí hiện tại từ GPS"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                        <span>Đang lấy...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
                        </svg>
                        <span>Vị trí của tôi</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={openMapPicker}
                    className="px-5 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[140px] bg-green-500 hover:bg-green-600 text-white hover:scale-105 transform"
                    title="Chọn vị trí trên bản đồ"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>Chọn trên bản đồ</span>
                  </button>
                </div>
                
                {/* Thông báo lỗi GPS */}
                {locationError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {locationError}
                  </div>
                )}
              </div>
            </div>

            {/* Sở thích */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                   Chọn sở thích
                </span>
              </label>
                                           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {preferenceOptions.map(option => (
                    <div key={option.id} className="group">
                      <label 
                        htmlFor={option.id} 
                        className="flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm border border-transparent hover:border-purple-200 group-hover:scale-[1.02]"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={option.id}
                            checked={preferences[option.id] || false}
                            onChange={() => handlePreferenceChange(option.id)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                            preferences[option.id] 
                              ? 'bg-purple-500 border-purple-500 transform scale-110' 
                              : 'border-gray-300 hover:border-purple-400 group-hover:border-purple-500'
                          }`}>
                            {preferences[option.id] && (
                              <svg 
                                className="w-3 h-3 text-white animate-in zoom-in duration-200" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth="3" 
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className={`ml-3 text-sm font-medium transition-colors duration-200 ${
                          preferences[option.id] 
                            ? 'text-purple-700' 
                            : 'text-gray-700 group-hover:text-purple-600'
                        }`}>
                          {option.label}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                 
                 {/* Tùy chọn khác */}
                 <div className="border-t border-gray-200 pt-4">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Tùy chọn khác (không bắt buộc)
                   </label>
                   <input
                     type="text"
                     value={otherPreference}
                     onChange={(e) => setOtherPreference(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-colors text-sm"
                     placeholder="Ví dụ: Karaoke, Bowling, Spa..."
                   />
                 </div>
               </div>
            </div>

            {/* Thống kê */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Thống kê lựa chọn</h3>
                </div>
                                 <div className="text-right">
                   <div className="text-lg font-semibold text-purple-600">
                     {Object.values(preferences).filter(Boolean).length + (otherPreference.trim() ? 1 : 0)} sở thích
                   </div>
                   <div className="text-xs text-gray-600">đã được chọn</div>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          {hasChanges && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-orange-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  Bạn có thay đổi chưa lưu
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium shadow-md"
                  >
                     Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </LeaderLayout>

      {/* Map Location Picker Modal */}
      <MapLocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleMapLocationSelect}
        initialLocation={location}
      />
    </div>
  );
};

export default LocationPreference;
