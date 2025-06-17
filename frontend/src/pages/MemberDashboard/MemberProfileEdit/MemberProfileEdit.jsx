import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../../services/profileService';

const MemberProfileEdit = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [userDataForm, setUserDataForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Function to get avatar initials and background color (same as MemberProfile)
  const getAvatarInfo = (name) => {
    if (!name || name === 'Chưa cập nhật tên') {
      return { initials: 'U', bgColor: 'bg-gray-500' };
    }
    
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    // Generate consistent color based on name
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500'
    ];
    
    const colorIndex = name.length % colors.length;
    return { initials, bgColor: colors[colorIndex] };
  };

  // Lấy dữ liệu từ API khi component được mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        
        if (response.success) {
          setUserDataForm({
            name: response.data.name || '',
            phone: response.data.phone || '',
            email: response.data.email || ''
          });
        } else {
          alert(response.message || 'Không thể tải thông tin người dùng');
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        alert('Đã xảy ra lỗi khi tải thông tin người dùng.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Họ tên không được để trống';
    if (name.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    if (name.trim().length > 50) return 'Họ tên không được quá 50 ký tự';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Số điện thoại không được để trống';
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.trim())) return 'Số điện thoại phải có 10-11 chữ số';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email không được để trống';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Email không đúng định dạng';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Cập nhật giá trị
    setUserDataForm(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Validate real-time
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      default:
        break;
    }

    // Cập nhật errors
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
  };



  const validateForm = () => {
    const newErrors = {
      name: validateName(userDataForm.name),
      phone: validatePhone(userDataForm.phone),
      email: validateEmail(userDataForm.email)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const profileData = {
        name: userDataForm.name.trim(),
        phone: userDataForm.phone.trim(),
        email: userDataForm.email.trim().toLowerCase(),
      };
      
      const updateResponse = await updateUserProfile(profileData);
      
      if (updateResponse.success) {
        alert('Cập nhật thông tin thành công!');
        navigate('/profile');
      } else {
        alert(updateResponse.message || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      alert('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Đang tải thông tin...</p>
            <p className="text-gray-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section with Same Style as MemberProfile */}
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 pt-16 pb-32">
        <div className="absolute inset-0 bg-white opacity-50"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Edit Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white backdrop-blur-sm rounded-lg hover:bg-gray-50 shadow-sm transition-all duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Trở về
            </button>
          </div>

          {/* Profile Header */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className={`w-32 h-32 rounded-full border-4 border-white shadow-2xl flex items-center justify-center ${getAvatarInfo(userDataForm.name).bgColor}`}>
                <span className="text-white text-4xl font-bold">
                  {getAvatarInfo(userDataForm.name).initials}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative -mt-20 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center">
              Cập nhật thông tin
            </h3>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={userDataForm.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Nhập họ tên của bạn"
                    required
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs mt-1 block">{errors.name}</span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={userDataForm.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="0123456789"
                    required
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-xs mt-1 block">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={userDataForm.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 transition-colors ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="example@email.com"
                    required
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>
                  )}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || Object.values(errors).some(error => error !== '')}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberProfileEdit;
