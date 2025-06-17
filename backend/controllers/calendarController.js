const CalendarService = require('../services/calendarService');
const User = require('../models/userModel');
const db = require('../utils/db');

/**
 * Calendar Controller
 * Handles Google Calendar sync operations
 */

// Sync user's Google Calendar
exports.syncCalendar = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { startDate, endDate, removeConflicts = false, groupId } = req.body;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }
    
    // Get user's Google access token
    const user = await User.getById(userId);
    if (!user || !user.google_access_token) {
      console.log('❌ User not found or no Google access token:', { userId, hasUser: !!user, hasToken: !!user?.google_access_token });
      return res.status(400).json({
        success: false,
        message: 'Google account not linked. Please link your Google account first.'
      });
    }
    
    // Refresh token if needed
    console.log('🔍 Token expires at:', user.google_token_expires_at);
    const tokenResult = await CalendarService.refreshAccessTokenIfNeeded(user);
    if (!tokenResult.success) {
      console.log('❌ Token refresh failed:', tokenResult);
      return res.status(400).json({
        success: false,
        message: tokenResult.message,
        error: tokenResult.error
      });
    }
    
    // Call CalendarService to sync
    const syncResult = await CalendarService.syncUserCalendar(
      tokenResult.accessToken,
      new Date(startDate),
      new Date(endDate)
    );
    
    if (!syncResult.success) {
      return res.status(500).json(syncResult);
    }

    // Handle conflicts if removeConflicts is true
    let conflictsResolved = 0;
    if (removeConflicts && syncResult.data.busyTimes.length > 0) {
      console.log('🔍 Checking for conflicts with existing timeslots...');
      
      // Filter busy times để chỉ giữ lại những busy times trong phạm vi tuần được chọn
      const weekStartDate = new Date(startDate);
      const weekEndDate = new Date(endDate);
      
      const filteredBusyTimes = syncResult.data.busyTimes.filter(busyTime => {
        const busyStart = new Date(busyTime.start);
        const busyStartDate = busyStart.toISOString().split('T')[0];
        const weekStartDateStr = weekStartDate.toISOString().split('T')[0];
        const weekEndDateStr = weekEndDate.toISOString().split('T')[0];
        
        // Strict filter: chỉ giữ busy times có start date nằm trong phạm vi tuần
        return busyStartDate >= weekStartDateStr && busyStartDate <= weekEndDateStr;
      });
      
      console.log(`📊 Found ${filteredBusyTimes.length} busy times in current week range`);
      
      // Get existing timeslots in the date range  
      let timeslotQuery = `
        SELECT timeslot_id, start_time, end_time 
        FROM timeslots 
        WHERE user_id = ? AND DATE(start_time) >= DATE(?) AND DATE(start_time) <= DATE(?)
      `;
      let queryParams = [userId, startDate, endDate];
      
      // Add group_id filter if provided
      if (groupId) {
        timeslotQuery += ` AND group_id = ?`;
        queryParams.push(groupId);
      }
      
      const [existingTimeslots] = await db.query(timeslotQuery, queryParams);
      
      console.log(`📊 Found ${existingTimeslots.length} existing timeslots in date range`);
      
      const conflictingTimeslots = [];
      
      // Check for conflicts
      existingTimeslots.forEach(timeslot => {
        const timeslotStart = new Date(timeslot.start_time);
        const timeslotEnd = new Date(timeslot.end_time);
        
        // Check if this timeslot conflicts with any busy time (chỉ trong phạm vi tuần)
        const hasConflict = filteredBusyTimes.some(busyTime => {
          const busyStart = new Date(busyTime.start);
          const busyEnd = new Date(busyTime.end);
          
          // Check for overlap: timeslot overlaps with busy time
          return (timeslotStart < busyEnd && timeslotEnd > busyStart);
        });
        
        if (hasConflict) {
          conflictingTimeslots.push(timeslot);
        }
      });
      
      // Delete conflicting timeslots
      if (conflictingTimeslots.length > 0) {
        console.log(`❌ Found ${conflictingTimeslots.length} conflicting timeslots, removing...`);
        
        const deletePromises = conflictingTimeslots.map(timeslot => 
          db.query('DELETE FROM timeslots WHERE timeslot_id = ?', [timeslot.timeslot_id])
        );
        
        await Promise.all(deletePromises);
        conflictsResolved = conflictingTimeslots.length;
        
        console.log(`✅ Removed ${conflictsResolved} conflicting timeslots`);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...syncResult.data,
        conflictsResolved
      },
      message: `Đồng bộ Google Calendar thành công. Tìm thấy ${syncResult.data.busyTimes.length} lịch bận từ Google Calendar${conflictsResolved > 0 ? `. ⚠️Đã xóa ${conflictsResolved} lịch rảnh bị xung đột.` : '. 😊Không có xung đột với thời gian rảnh.'}`
    });
    
  } catch (error) {
    console.error('❌ Calendar sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Calendar sync failed'
    });
  }
};

// Get calendar sync status
exports.getSyncStatus = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const user = await User.getById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Kiểm tra xem user có liên kết Google Account không (có thể đăng nhập bằng Google từ đầu hoặc liên kết sau)
    const hasGoogleAccount = !!(user.google_id);
    
    // Kiểm tra xem có access token không
    const hasAccessToken = !!(user.google_access_token);
    
    // Kiểm tra và refresh token nếu cần
    let tokenExpired = false;
    let actuallyWorking = hasGoogleAccount && hasAccessToken;
    
    if (hasAccessToken && user.google_token_expires_at) {
      const now = new Date();
      const expiryDate = new Date(user.google_token_expires_at);
      tokenExpired = now >= expiryDate;
      
      // Nếu token hết hạn, thử refresh
      if (tokenExpired && user.google_refresh_token) {
        const refreshResult = await CalendarService.refreshAccessTokenIfNeeded(user);
        if (refreshResult.success) {
          tokenExpired = false;
          actuallyWorking = true;
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        hasGoogleAccount,
        hasAccessToken,
        tokenExpired,
        isLinked: actuallyWorking && !tokenExpired,
        googleEmail: user.email || null,
        lastSyncAt: user.last_calendar_sync || null
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting calendar status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get calendar status'
    });
  }
};

// Get suggested free times based on Google Calendar
exports.getSuggestedFreeTimes = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { date, duration = 60 } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    // Get user's Google access token
    const user = await User.getById(userId);
    if (!user || !user.google_access_token) {
      return res.status(400).json({
        success: false,
        message: 'Google account not linked. Please sync your calendar first.'
      });
    }
    
    // Refresh token if needed
    const tokenResult = await CalendarService.refreshAccessTokenIfNeeded(user);
    if (!tokenResult.success) {
      return res.status(400).json({
        success: false,
        message: tokenResult.message,
        error: tokenResult.error
      });
    }
    
    // Sync calendar for the specific date
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const syncResult = await CalendarService.syncUserCalendar(
      tokenResult.accessToken,
      startOfDay,
      endOfDay
    );
    
    if (!syncResult.success) {
      return res.status(500).json(syncResult);
    }
    
    // Filter free times for the requested duration
    const suggestedTimes = syncResult.data.freeTimes.filter(freeTime => {
      const durationMs = freeTime.end - freeTime.start;
      const durationMinutes = durationMs / (1000 * 60);
      return durationMinutes >= duration;
    });
    
    res.json({
      success: true,
      data: {
        date: date,
        duration: duration,
        suggestedTimes: suggestedTimes,
        totalSlots: suggestedTimes.length
      },
      message: `Found ${suggestedTimes.length} available time slots`
    });
    
  } catch (error) {
    console.error('❌ Error getting suggested times:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggested times'
    });
  }
}; 