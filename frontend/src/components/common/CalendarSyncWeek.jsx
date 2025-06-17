import React, { useState, useEffect } from 'react';
import { getCalendarSyncStatus, syncGoogleCalendar } from '../../services/calendarService';

/**
 * CalendarSyncWeek Component
 * Version đơn giản chỉ sync Google Calendar theo tuần, không hiển thị suggestions
 */
const CalendarSyncWeek = ({ 
  weekRange,
  groupId,
  onSyncComplete,
  className = ""
}) => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [removeConflicts, setRemoveConflicts] = useState(true);

  // Check sync status on component mount
  useEffect(() => {
    checkSyncStatus();
  }, []);

  // Re-check sync status when window gains focus (user returns from Google auth)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔍 Window focused, re-checking sync status...');
      // Delay để đảm bảo backend đã xử lý xong
      setTimeout(() => {
        checkSyncStatus();
      }, 500);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔍 Page visible, re-checking sync status...');
        setTimeout(() => {
          checkSyncStatus();
        }, 500);
      }
    };

    // Lắng nghe message từ popup Google auth
    const handleMessage = (event) => {
      console.log('🔔 CalendarSyncWeek received message:', event.data);
      if (event.data.type === 'GOOGLE_LINK_SUCCESS') {
        console.log('🔍 Received Google link success message, refreshing status...');
        // Cập nhật localStorage với token mới
        if (event.data.data.token) {
          localStorage.setItem('token', event.data.data.token);
          localStorage.setItem('user', JSON.stringify(event.data.data.userData));
        }
        
        // Hiển thị thông báo nếu email được cập nhật
        if (event.data.data.emailUpdated && event.data.data.userData?.email) {
          console.log('🚨 CalendarSyncWeek showing alert...');
          setTimeout(() => {
            alert(`Liên kết Google Account thành công!\n\nEmail tài khoản đã được cập nhật thành: ${event.data.data.userData.email}\n\nBây giờ bạn có thể sử dụng tính năng đồng bộ Google Calendar.`);
          }, 1000);
        }
        
        // Refresh sync status
        setTimeout(() => {
          checkSyncStatus();
        }, 500);
      } else if (event.data.type === 'GOOGLE_LINK_ERROR') {
        console.error('Google link error:', event.data.error);
        setError('Liên kết Google Account thất bại: ' + event.data.error);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const checkSyncStatus = async () => {
    try {
      const result = await getCalendarSyncStatus();
      setSyncStatus(result);
      if (!result.success) {
        setError(result.message);
      } else {
        // Clear error if status check successful
        setError(null);
        console.log('📊 Calendar sync status:', result.data);
      }
    } catch (error) {
      console.error('❌ Error checking sync status:', error);
      setError('Không thể kiểm tra trạng thái sync');
    }
  };

  const handleWeekSync = async () => {
    if (!weekRange?.startDate || !weekRange?.endDate) {
      setError('Vui lòng chọn tuần trước khi sync');
      return;
    }

    setSyncing(true);
    setError(null);
    
    try {
      console.log('🔄 Syncing week:', weekRange);
      
      // Điều chỉnh endDate để bao gồm toàn bộ ngày Chủ nhật  
      const adjustedStartDate = weekRange.startDate.toISOString().split('T')[0];
      const endDate = new Date(weekRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Cuối ngày Chủ nhật
      const adjustedEndDate = endDate.toISOString().split('T')[0];
      
      console.log('📅 Adjusted dates:', { 
        original: { start: weekRange.startDate, end: weekRange.endDate },
        adjusted: { start: adjustedStartDate, end: adjustedEndDate }
      });
      
      const result = await syncGoogleCalendar(
        adjustedStartDate, 
        adjustedEndDate,
        { removeConflicts, groupId }
      );
      
      if (result.success) {
        console.log('Week sync completed:', result.data);
        if (onSyncComplete) {
          onSyncComplete(result);
        }
        
        alert(`${result.message}`);
        
      } else {
        // Xử lý các loại lỗi khác nhau
        if (result.error === 'TOKEN_EXPIRED_NO_REFRESH' || result.error === 'REFRESH_FAILED') {
          setError(`${result.message} Vui lòng liên kết lại Google Account.`);
          // Tự động refresh sync status
          setTimeout(() => {
            checkSyncStatus();
          }, 1000);
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      console.error('❌ Week sync failed:', error);
      setError('Đồng bộ thất bại');
    } finally {
      setSyncing(false);
    }
  };

  const formatWeekRange = () => {
    if (!weekRange?.startDate || !weekRange?.endDate) {
      return 'Chưa chọn tuần';
    }
    const start = new Date(weekRange.startDate);
    const end = new Date(weekRange.endDate);
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  };

  const renderSyncStatus = () => {
    if (!syncStatus) return null;

    const { data } = syncStatus;
    
    if (!data.hasGoogleAccount) {
      return (
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          <span className="text-sm">Chưa liên kết Google Account</span>
        </div>
      );
    }

    if (!data.isLinked) {
      return (
        <div className="flex items-center space-x-2 text-orange-600">
          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
          <span className="text-sm">
            {data.tokenExpired ? 'Token đã hết hạn' : 'Chưa có quyền truy cập Calendar'}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-green-600">
        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        <span className="text-sm">Đã kết nối với Google Calendar</span>
      </div>
    );
  };

  const canSync = syncStatus?.data?.isLinked;

  // Helper function để theo dõi popup với COOP protection
  const trackPopupClose = (popup) => {
    const checkClosed = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkClosed);
          console.log('🔍 Google auth popup closed, refreshing status...');
          setTimeout(() => {
            checkSyncStatus();
          }, 1000);
        }
      } catch (error) {
        // Cross-Origin-Opener-Policy block - sử dụng timer thay thế
        console.log('⚠️ Cannot check window.closed due to COOP, using timer fallback');
        clearInterval(checkClosed);
        // Tự động refresh sau 30 giây nếu không thể check window.closed
        setTimeout(() => {
          console.log('🔍 Timer fallback: refreshing status...');
          checkSyncStatus();
        }, 30000);
      }
    }, 1000);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Kiểm tra lịch bận từ Google Calendar</h3>
          <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full inline-block">
            Tuần: {formatWeekRange()}
          </p>
        </div>
        {canSync && weekRange?.startDate && (
          <button
            onClick={handleWeekSync}
            disabled={syncing}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center space-x-2"
          >
            {syncing ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Đang đồng bộ...</span>
              </>
            ) : (
              <span>Đồng bộ</span>
            )}
          </button>
        )}
      </div>

      {/* Sync Status */}
      <div className="mb-3">
        {renderSyncStatus()}
      </div>

      {/* Thông báo tính năng chính thay vì checkbox */}
      {canSync && weekRange?.startDate && (
        <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
          <span className="text-blue-800 font-medium text-sm">
            Tự động xóa lịch rảnh nếu trùng với lịch bận trên Google Calendar
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg text-sm text-red-700 hover:shadow-sm transition-shadow duration-200">
          {error}
        </div>
      )}

      {/* Instructions for non-Google users */}
      {!syncStatus?.data?.hasGoogleAccount && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
          <p className="text-sm text-blue-800 mb-3 font-medium">
            Đăng nhập bằng Google để đồng bộ Calendar
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                // Lấy token từ localStorage và truyền vào URL
                const token = localStorage.getItem('token');
                const linkUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google/link${token ? `?token=${token}` : ''}`;
                
                // Mở popup để liên kết Google Account
                const newWindow = window.open(linkUrl, 'googleAuth', 'width=500,height=600,scrollbars=yes,resizable=yes');
                
                // Theo dõi khi popup đóng để refresh status
                trackPopupClose(newWindow);
              }}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-md transform transition-all duration-200"
            >
              Liên kết Google Account
            </button>
            <button 
              onClick={checkSyncStatus}
              className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Kiểm tra lại trạng thái"
            >
              🔄
            </button>
          </div>
        </div>
      )}

      {/* Token expired or no access token */}
      {syncStatus?.data?.hasGoogleAccount && !syncStatus?.data?.isLinked && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
          <p className="text-sm text-orange-800 mb-3 font-medium">
            {syncStatus?.data?.tokenExpired ? 'Token Google đã hết hạn' : 'Cần cấp quyền truy cập Google Calendar'}
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => {
                const token = localStorage.getItem('token');
                const linkUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google/link${token ? `?token=${token}` : ''}`;
                
                // Mở popup để liên kết Google Account
                const newWindow = window.open(linkUrl, 'googleAuth', 'width=500,height=600,scrollbars=yes,resizable=yes');
                
                // Theo dõi khi popup đóng để refresh status
                trackPopupClose(newWindow);
              }}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 hover:scale-105 hover:shadow-md transform transition-all duration-200"
            >
              Cấp quyền lại
            </button>
            <button 
              onClick={checkSyncStatus}
              className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Kiểm tra lại trạng thái"
            >
              🔄
            </button>
          </div>
        </div>
      )}

      {/* No week selected */}
      {!weekRange?.startDate && canSync && (
        <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 font-medium hover:shadow-sm transition-shadow duration-200">
          Vui lòng chọn tuần để đồng bộ lịch
        </div>
      )}
    </div>
  );
};

export default CalendarSyncWeek; 