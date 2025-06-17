import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import enterpriseService from '../../../services/enterpriseService';

const EnterpriseProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [availableFacilities, setAvailableFacilities] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    setAvailableFacilities(enterpriseService.getAvailableFacilities());
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await enterpriseService.getMyProfile();
      setProfile(data);
      setFormData({
        name: data.name || '',
        enterprise_type: data.enterprise_type || '',
        contact_person: data.contact_person || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        opening_hours: data.opening_hours || '',
        capacity: data.capacity || '',
        facilities: data.facilities || []
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin profile:', error);
      alert('Có lỗi xảy ra khi tải thông tin doanh nghiệp.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      await enterpriseService.updateMyProfile(formData);
      await fetchProfile(); // Refresh data
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original profile data
    setFormData({
      name: profile.name || '',
      enterprise_type: profile.enterprise_type || '',
      contact_person: profile.contact_person || '',
      description: profile.description || '',
      address: profile.address || '',
      phone: profile.phone || '',
      email: profile.email || '',
      website: profile.website || '',
      opening_hours: profile.opening_hours || '',
      capacity: profile.capacity || '',
      facilities: profile.facilities || []
    });
  };



  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50 items-center justify-center">
        <p className="text-gray-600">Không tìm thấy thông tin doanh nghiệp.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Header area */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Hồ sơ doanh nghiệp</h1>
            <p className="text-sm text-gray-600">Xem và quản lý thông tin doanh nghiệp</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button 
                onClick={handleEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={updateLoading}
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 border border-green-300 rounded-lg text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* Profile content */}
      <div className="flex-1 p-4">
        {/* Cover image placeholder */}
        <div className="relative mb-4">
          <div className="h-48 w-full rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-lg opacity-90">{profile.enterprise_type}</p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-4 transform translate-y-1/2 bg-white p-1 rounded-full border-4 border-white shadow-lg">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">
                {profile.name?.charAt(0) || 'D'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-14">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Tên doanh nghiệp</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                ) : (
                  <p className="text-gray-700">{profile.name}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Loại doanh nghiệp</h3>
                {isEditing ? (
                  <select 
                    name="enterprise_type"
                    value={formData.enterprise_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="">Chọn loại doanh nghiệp</option>
                    <option value="cafe">Cafe</option>
                    <option value="restaurant">Nhà hàng</option>
                    <option value="library">Thư viện</option>
                    <option value="cinema">Rạp phim</option>
                    <option value="other">Khác</option>
                  </select>
                ) : (
                  <p className="text-gray-700">{profile.enterprise_type || 'Chưa xác định'}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Người liên hệ</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Nhập tên người liên hệ..."
                  />
                ) : (
                  <p className="text-gray-700">{profile.contact_person || 'Chưa có thông tin người liên hệ'}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Mô tả</h3>
                {isEditing ? (
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    rows={4}
                    placeholder="Nhập mô tả về doanh nghiệp..."
                  />
                ) : (
                  <p className="text-gray-700">{profile.description || 'Chưa có mô tả'}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Địa chỉ</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Nhập địa chỉ..."
                  />
                ) : (
                  <p className="text-gray-700">{profile.address || 'Chưa có địa chỉ'}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Số điện thoại</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Nhập số điện thoại..."
                  />
                ) : (
                  <p className="text-gray-700">{profile.phone || 'Chưa có số điện thoại'}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Email</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Nhập email..."
                  />
                ) : (
                  <p className="text-gray-700">{profile.email}</p>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Website</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Nhập website..."
                  />
                ) : (
                  <p className="text-gray-700">{profile.website || 'Chưa có website'}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Giờ mở cửa</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    name="opening_hours"
                    value={formData.opening_hours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="VD: 07:00 - 22:00"
                  />
                ) : (
                  <p className="text-gray-700">{profile.opening_hours || 'Chưa có thông tin giờ mở cửa'}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Sức chứa</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="VD: 50 người"
                  />
                ) : (
                  <p className="text-gray-700">{profile.capacity || 'Chưa có thông tin sức chứa'}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-500 uppercase font-medium mb-1">Tiện nghi</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {availableFacilities.map((facility) => (
                        <label key={facility} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.facilities.includes(facility)}
                            onChange={() => handleFacilityToggle(facility)}
                            className="mr-2"
                          />
                          <span className="text-sm">{facility}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Chọn các tiện nghi có sẵn</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.facilities && profile.facilities.length > 0 ? (
                      profile.facilities.map((facility, index) => (
                        <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-sm">
                          {facility}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-700">Chưa có thông tin tiện nghi</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseProfile;
