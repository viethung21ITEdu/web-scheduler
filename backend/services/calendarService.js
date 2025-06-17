const { google } = require('googleapis');

/**
 * Google Calendar Service
 * Handles all Google Calendar API interactions
 */
class CalendarService {
  
  /**
   * Tạo OAuth2 client với access token và refresh token
   */
  static createOAuth2Client(accessToken, refreshToken = null) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    const credentials = { access_token: accessToken };
    if (refreshToken) {
      credentials.refresh_token = refreshToken;
    }
    
    oauth2Client.setCredentials(credentials);
    
    return oauth2Client;
  }

  /**
   * Refresh access token nếu cần
   */
  static async refreshAccessTokenIfNeeded(user) {
    try {
      const now = new Date();
      const expiryDate = user.google_token_expires_at ? new Date(user.google_token_expires_at) : null;
      
      console.log('🔍 Token check:', {
        userId: user.user_id,
        now: now.toISOString(),
        expiryDate: expiryDate?.toISOString(),
        hasRefreshToken: !!user.google_refresh_token,
        isExpired: expiryDate ? now >= expiryDate : true
      });
      
      // Kiểm tra xem token có hết hạn không (thêm buffer 5 phút)
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      if (expiryDate && (now.getTime() + bufferTime) < expiryDate.getTime()) {
        console.log('✅ Token still valid');
        return { success: true, accessToken: user.google_access_token };
      }

      // Token đã hết hạn hoặc sắp hết hạn, cần refresh
      if (!user.google_refresh_token) {
        console.log('❌ No refresh token available');
        return { 
          success: false, 
          error: 'TOKEN_EXPIRED_NO_REFRESH',
          message: 'Google token đã hết hạn và không có refresh token. Vui lòng liên kết lại Google Account.' 
        };
      }

      console.log('🔄 Attempting to refresh token...');
      const oauth2Client = this.createOAuth2Client(user.google_access_token, user.google_refresh_token);
      
      const { credentials } = await oauth2Client.refreshAccessToken();
      console.log('✅ Token refreshed successfully:', {
        newExpiryDate: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : 'No expiry'
      });
      
      // Cập nhật token mới vào database
      const db = require('../utils/db');
      const newExpiryDate = credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600 * 1000);
      
      await db.query(
        'UPDATE users SET google_access_token = ?, google_token_expires_at = ? WHERE user_id = ?',
        [credentials.access_token, newExpiryDate, user.user_id]
      );

      return { 
        success: true, 
        accessToken: credentials.access_token,
        refreshed: true 
      };

    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      return { 
        success: false, 
        error: 'REFRESH_FAILED',
        message: 'Không thể làm mới Google token. Vui lòng liên kết lại Google Account.' 
      };
    }
  }

  /**
   * Lấy danh sách events từ Google Calendar
   * @param {string} accessToken - Google OAuth access token
   * @param {Date} timeMin - Thời gian bắt đầu
   * @param {Date} timeMax - Thời gian kết thúc
   * @returns {Array} Danh sách calendar events
   */
  static async getCalendarEvents(accessToken, timeMin, timeMax) {
    try {
      const oauth2Client = this.createOAuth2Client(accessToken);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      
      return events.map(event => ({
        id: event.id,
        summary: event.summary || 'No title',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        status: event.status,
        transparency: event.transparency // 'opaque' = busy, 'transparent' = free
      }));

    } catch (error) {
      console.error('❌ Error fetching calendar events:', error);
      throw error;
    }
  }

  /**
   * Parse busy times từ calendar events
   * @param {Array} events - Calendar events
   * @returns {Array} Danh sách busy time slots
   */
  static parseBusyTimes(events) {
    try {
      const busyTimes = [];
      
      events.forEach(event => {
        // Chỉ tính events có thời gian cụ thể (không phải all-day)
        // và status là 'confirmed' và transparency là 'opaque' (busy)
        if (event.start && event.end && 
            event.status === 'confirmed' &&
            event.transparency !== 'transparent' &&
            event.start.includes('T') && event.end.includes('T')) {
          
          busyTimes.push({
            start: new Date(event.start),
            end: new Date(event.end),
            summary: event.summary
          });
        }
      });

      // Sắp xếp theo thời gian bắt đầu
      busyTimes.sort((a, b) => a.start - b.start);
      
      return busyTimes;
      
    } catch (error) {
      console.error('❌ Error parsing busy times:', error);
      throw error;
    }
  }

  /**
   * Tính free times từ busy times trong một ngày
   * @param {Array} busyTimes - Danh sách busy times đã sort
   * @param {Date} dayStart - Bắt đầu ngày làm việc
   * @param {Date} dayEnd - Kết thúc ngày làm việc
   * @returns {Array} Danh sách free time slots
   */
  static calculateFreeTimes(busyTimes, dayStart, dayEnd) {
    const freeTimes = [];
    let currentTime = new Date(dayStart);

    // Merge overlapping busy times trước
    const mergedBusyTimes = this.mergeBusyTimes(busyTimes);

    for (const busyTime of mergedBusyTimes) {
      const busyStart = new Date(Math.max(busyTime.start, dayStart));
      const busyEnd = new Date(Math.min(busyTime.end, dayEnd));

      // Nếu có khoảng trống trước busy time
      if (currentTime < busyStart) {
        freeTimes.push({
          start: new Date(currentTime),
          end: new Date(busyStart)
        });
      }

      // Di chuyển currentTime đến sau busy time
      currentTime = new Date(Math.max(currentTime, busyEnd));
    }

    // Nếu còn thời gian trống đến cuối ngày
    if (currentTime < dayEnd) {
      freeTimes.push({
        start: new Date(currentTime),
        end: new Date(dayEnd)
      });
    }

    // Lọc ra những free times có ít nhất 30 phút
    return freeTimes.filter(freeTime => {
      const duration = freeTime.end - freeTime.start;
      return duration >= 30 * 60 * 1000; // 30 minutes
    });
  }

  /**
   * Merge overlapping busy times
   */
  static mergeBusyTimes(busyTimes) {
    if (busyTimes.length === 0) return [];
    
    const merged = [busyTimes[0]];
    
    for (let i = 1; i < busyTimes.length; i++) {
      const current = busyTimes[i];
      const last = merged[merged.length - 1];
      
      if (current.start <= last.end) {
        // Overlap - merge them
        last.end = current.end > last.end ? current.end : last.end;
        last.summary += `, ${current.summary}`;
      } else {
        // No overlap - add as new
        merged.push(current);
      }
    }
    
    return merged;
  }

  /**
   * Sync user calendar và return suggested timeslots
   * @param {string} accessToken - Google OAuth access token  
   * @param {Date} startDate - Ngày bắt đầu sync
   * @param {Date} endDate - Ngày kết thúc sync
   * @returns {Object} Sync result với busy times và suggested free times
   */
  static async syncUserCalendar(accessToken, startDate, endDate) {
    try {
      // Lấy events từ Google Calendar
      const events = await this.getCalendarEvents(accessToken, startDate, endDate);
      
      // Parse busy times
      const busyTimes = this.parseBusyTimes(events);
      
      // Tính free times (working hours 7 AM - 10 PM để match với web)
      const freeTimes = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(7, 0, 0, 0); // 7:00 AM (match với web)
        
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(22, 0, 0, 0); // 10:00 PM
        
        // Lọc busy times của ngày hiện tại (chỉ trong working hours)
        const dailyBusyTimes = busyTimes.filter(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          
          // Sử dụng UTC để tránh vấn đề timezone  
          const busyDateUTC = new Date(busyStart.getUTCFullYear(), busyStart.getUTCMonth(), busyStart.getUTCDate());
          const currentDateUTC = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());
          

          
          // Chỉ tính busy times trong ngày và overlap với working hours
          const isDateMatch = busyDateUTC.getTime() === currentDateUTC.getTime();
          const isOverlapWithWorkingHours = busyEnd > dayStart && busyStart < dayEnd;
          
          return isDateMatch && isOverlapWithWorkingHours;
        });
        
        // Tính free times cho ngày này
        const dailyFreeTimes = this.calculateFreeTimes(dailyBusyTimes, dayStart, dayEnd);
        freeTimes.push(...dailyFreeTimes);
        
        // Chuyển sang ngày tiếp theo
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return {
        success: true,
        data: {
          busyTimes,
          freeTimes,
          syncedAt: new Date()
        },
        message: `Sync completed: ${busyTimes.length} busy slots, ${freeTimes.length} free slots found`
      };
      
    } catch (error) {
      console.error('❌ Calendar sync failed:', error);
      return {
        success: false,
        message: error.message || 'Calendar sync failed'
      };
    }
  }
}

module.exports = CalendarService; 