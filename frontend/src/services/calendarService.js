import api from './api';

/**
 * Calendar Service - Frontend
 * Handles Google Calendar integration APIs
 */

// Get calendar sync status for current user
export const getCalendarSyncStatus = async () => {
  try {
    const response = await api.get('/calendar/status');
    return response.data;
  } catch (error) {
    console.error('❌ Error getting calendar sync status:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể kiểm tra trạng thái sync',
    };
  }
};

// Sync user's Google Calendar for date range
export const syncGoogleCalendar = async (startDate, endDate, options = {}) => {
  try {
    const response = await api.post('/calendar/sync', {
      startDate,
      endDate,
      ...options
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error syncing calendar:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể đồng bộ calendar',
    };
  }
};

// Get suggested free times for a specific date
export const getSuggestedFreeTimes = async (date, duration = 60) => {
  try {
    const response = await api.get('/calendar/suggested-times', {
      params: { date, duration }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error getting suggested times:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể lấy thời gian gợi ý',
    };
  }
};

// Format suggested times for display
export const formatSuggestedTimes = (suggestedTimes) => {
  return suggestedTimes.map(time => ({
    start: new Date(time.start),
    end: new Date(time.end),
    display: `${new Date(time.start).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${new Date(time.end).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  }));
};

// Quick sync for current week
export const quickSyncCurrentWeek = async () => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    return await syncGoogleCalendar(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  } catch (error) {
    console.error('❌ Error in quick sync:', error);
    return {
      success: false,
      message: 'Không thể đồng bộ tuần này',
    };
  }
}; 