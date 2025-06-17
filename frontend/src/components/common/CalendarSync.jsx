import React, { useState, useEffect } from 'react';
import { getCalendarSyncStatus, getSuggestedFreeTimes, formatSuggestedTimes, quickSyncCurrentWeek } from '../../services/calendarService';

/**
 * CalendarSync Component
 * Hiển thị trạng thái đồng bộ Google Calendar và thời gian gợi ý
 */
const CalendarSync = ({ 
  selectedDate,
  duration = 60,
  onSuggestedTimeSelect,
  onSyncComplete,
  className = ""
}) => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [suggestedTimes, setSuggestedTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check sync status on component mount
  useEffect(() => {
    checkSyncStatus();
  }, []);

  // Re-check sync status when window gains focus (user returns from Google auth)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔍 Window focused, re-checking sync status...');
      checkSyncStatus();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Get suggested times when date changes
  useEffect(() => {
    if (selectedDate && syncStatus?.data?.hasAccessToken && !syncStatus?.data?.tokenExpired) {
      getSuggestedTimes();
    }
  }, [selectedDate, syncStatus]);

  const checkSyncStatus = async () => {
    try {
      const result = await getCalendarSyncStatus();
      setSyncStatus(result);
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError('Không thể kiểm tra trạng thái sync');
    }
  };

  const getSuggestedTimes = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getSuggestedFreeTimes(selectedDate, duration);
      if (result.success) {
        const formatted = formatSuggestedTimes(result.data.suggestedTimes);
        setSuggestedTimes(formatted);
        setShowSuggestions(formatted.length > 0);
      } else {
        setError(result.message);
        setSuggestedTimes([]);
      }
    } catch (error) {
      setError('Không thể lấy thời gian gợi ý');
      setSuggestedTimes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSync = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      const result = await quickSyncCurrentWeek();
      if (result.success) {
        await checkSyncStatus(); // Refresh status
        if (selectedDate) {
          await getSuggestedTimes(); // Refresh suggestions
        }
        if (onSyncComplete) {
          onSyncComplete(result);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Đồng bộ thất bại');
    } finally {
      setSyncing(false);
    }
  };

  const handleSuggestedTimeClick = (suggestedTime) => {
    if (onSuggestedTimeSelect) {
      onSuggestedTimeSelect({
        start: suggestedTime.start,
        end: suggestedTime.end,
        startTime: suggestedTime.startFormatted,
        endTime: suggestedTime.endFormatted
      });
    }
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

    if (!data.hasAccessToken || data.tokenExpired) {
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
        <span className="text-sm">Google Calendar đã kết nối</span>
      </div>
    );
  };

  const canSync = syncStatus?.data?.hasAccessToken && !syncStatus?.data?.tokenExpired;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📅</span>
          <h3 className="font-medium text-gray-900">Google Calendar</h3>
        </div>
        {canSync && (
          <button
            onClick={handleQuickSync}
            disabled={syncing}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? 'Đang sync...' : 'Sync'}
          </button>
        )}
      </div>

      {/* Sync Status */}
      <div className="mb-3">
        {renderSyncStatus()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Suggested Times Section */}
      {canSync && selectedDate && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Thời gian rảnh gợi ý {selectedDate}
            </span>
            {suggestedTimes.length > 0 && (
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                {showSuggestions ? 'Ẩn' : 'Hiện'} ({suggestedTimes.length})
              </button>
            )}
          </div>

          {loading && (
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Đang tìm thời gian rảnh...</span>
            </div>
          )}

          {/* Suggested Times List */}
          {showSuggestions && suggestedTimes.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {suggestedTimes.map((time, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedTimeClick(time)}
                  className="w-full text-left p-2 rounded bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      {time.startFormatted} - {time.endFormatted}
                    </span>
                    <span className="text-xs text-green-600">
                      {time.durationFormatted}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && suggestedTimes.length === 0 && selectedDate && (
            <div className="text-sm text-gray-500 text-center py-2">
              Không có thời gian rảnh phù hợp
            </div>
          )}
        </div>
      )}

      {/* Instructions for non-Google users */}
      {!syncStatus?.data?.hasGoogleAccount && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700 mb-2">
            💡 Đăng nhập bằng Google để đồng bộ Calendar và nhận gợi ý thời gian rảnh
          </p>
          <button 
            onClick={() => {
              // Lấy token từ localStorage và truyền vào URL
              const token = localStorage.getItem('token');
              const linkUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google/link${token ? `?token=${token}` : ''}`;
              window.location.href = linkUrl;
            }}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Liên kết Google Account →
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarSync; 