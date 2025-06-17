import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, getUserStats } from '../../../services/profileService';

const MemberProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [statsData, setStatsData] = useState({
    groupCount: 0,
    eventCount: 0,
    recentActivities: []
  });

  // Function to get avatar initials and background color
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

  // Function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMs = now - activityDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return '1 ngày trước';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return activityDate.toLocaleDateString('vi-VN');
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lấy dữ liệu từ API mỗi khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Lấy thông tin profile và stats song song
        const [profileResponse, statsResponse] = await Promise.all([
          getUserProfile(),
          getUserStats()
        ]);
        
        if (profileResponse.success) {
          setUserData({
            name: profileResponse.data.name || '',
            phone: profileResponse.data.phone || '',
            email: profileResponse.data.email || ''
          });
        } else {
          setError(profileResponse.message || 'Không thể tải thông tin người dùng');
        }
        
        if (statsResponse.success) {
          setStatsData({
            groupCount: statsResponse.data.groupCount || 0,
            eventCount: statsResponse.data.eventCount || 0,
            recentActivities: statsResponse.data.recentActivities || []
          });
        } else {
          console.warn('Không thể tải thống kê:', statsResponse.message);
          // Fallback data để tránh crash
          setStatsData({
            groupCount: 0,
            eventCount: 0,
            recentActivities: []
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError('Đã xảy ra lỗi khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);



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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section with Solid Background */}
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 pt-16 pb-32">
        <div className="absolute inset-0 bg-white opacity-50"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Edit Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => navigate('/profile/edit')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white backdrop-blur-sm rounded-lg hover:bg-gray-50 shadow-sm transition-all duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </button>
          </div>

          {/* Profile Header */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className={`w-32 h-32 rounded-full border-4 border-white shadow-2xl flex items-center justify-center ${getAvatarInfo(userData.name).bgColor}`}>
                <span className="text-white text-4xl font-bold">
                  {getAvatarInfo(userData.name).initials}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-gray-800">
              {userData.name || 'Chưa cập nhật tên'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative -mt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-6">
          {/* Main Info Card - Centered & Compact */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin cá nhân
                </h3>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Họ và tên</label>
                    <div className="flex items-center mt-1">
                      <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-gray-900 text-sm font-medium">{userData.name || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <div className="flex items-center mt-1">
                      <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-900 text-sm font-medium">{userData.email || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                    <div className="flex items-center mt-1">
                      <svg className="w-3 h-3 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-gray-900 text-sm font-medium">{userData.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trạng thái</label>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 mr-1 bg-green-400 rounded-full"></span>
                        Hoạt động
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Activity - Below, Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nhóm tham gia</span>
                  <span className="text-2xl font-bold text-blue-600">{statsData.groupCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sự kiện đã tham gia</span>
                  <span className="text-2xl font-bold text-green-600">{statsData.eventCount}</span>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h4>
              <div className="space-y-3">
                {statsData.recentActivities.length > 0 ? (
                  statsData.recentActivities.map((activity, index) => {
                    const colorClasses = [
                      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'
                    ];
                    const colorClass = colorClasses[index % colorClasses.length];
                    
                    const timeAgo = getTimeAgo(activity.date);
                    
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 ${colorClass} rounded-full mt-2`}></div>
                        <div>
                          <p className="text-sm text-gray-800">{activity.displayText}</p>
                          <p className="text-xs text-gray-500">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">Chưa có hoạt động gần đây</p>
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

export default MemberProfile;
