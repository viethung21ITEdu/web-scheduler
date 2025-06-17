import api from './api';

const timeslotService = {
  // Lấy tất cả timeslots của user hiện tại trong một nhóm cụ thể
  getUserTimeslots: async (groupId) => {
    try {
      if (!groupId) {
        throw new Error('Group ID là bắt buộc');
      }
      
      console.log(`🌐 API Call: GET /timeslots?groupId=${groupId}`);
      const response = await api.get(`/timeslots?groupId=${groupId}`);
      console.log('📥 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error (getUserTimeslots):', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      throw error;
    }
  },

  // Lấy tất cả timeslots của user hiện tại (không phân biệt nhóm)
  getAllUserTimeslots: async () => {
    try {
      console.log('🌐 API Call: GET /timeslots/all');
      const response = await api.get('/timeslots/all');
      console.log('📥 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error (getAllUserTimeslots):', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      throw error;
    }
  },

  // Tạo timeslot mới
  createTimeslot: async (timeslotData) => {
    try {
      if (!timeslotData.group_id) {
        throw new Error('Group ID là bắt buộc khi tạo timeslot');
      }
      
      console.log('🌐 API Call: POST /timeslots', timeslotData);
      const response = await api.post('/timeslots', timeslotData);
      console.log('📥 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error (createTimeslot):', error);
      console.error('Request data:', timeslotData);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      throw error;
    }
  },

  // Cập nhật timeslot
  updateTimeslot: async (timeslotId, timeslotData) => {
    try {
      console.log(`🌐 API Call: PUT /timeslots/${timeslotId}`, timeslotData);
      const response = await api.put(`/timeslots/${timeslotId}`, timeslotData);
      console.log('📥 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error (updateTimeslot):', error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  // Xóa timeslot
  deleteTimeslot: async (timeslotId) => {
    try {
      console.log(`🌐 API Call: DELETE /timeslots/${timeslotId}`);
      const response = await api.delete(`/timeslots/${timeslotId}`);
      console.log('📥 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error (deleteTimeslot):', error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  // Lấy timeslots của tất cả thành viên trong nhóm
  getGroupTimeslots: async (groupId) => {
    try {
      console.log(`🌐 API Call: GET /timeslots/group/${groupId}`);
      const response = await api.get(`/timeslots/group/${groupId}`);
      console.log('📥 API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error (getGroupTimeslots):', error);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  },

  // Tìm thời gian có sẵn chung của nhóm
  getGroupAvailableTime: async (groupId, startDate, endDate, duration) => {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
        duration: duration
      };
      const response = await api.get(`/timeslots/group/${groupId}/available`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching group available time:', error);
      throw error;
    }
  },

  // Format datetime cho backend (YYYY-MM-DD HH:mm:ss)
  formatDateTime: (date, time) => {
    // Đảm bảo đúng format YYYY-MM-DD bất kể múi giờ
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    console.log('🕒 Formatting datetime:', {
      originalDate: date.toString(),
      formattedDate: dateStr,
      time,
      result: `${dateStr} ${time}:00`
    });
    
    return `${dateStr} ${time}:00`;
  },

  // Parse datetime từ backend
  parseDateTime: (dateTimeStr) => {
    return new Date(dateTimeStr);
  },

  // Kiểm tra xung đột thời gian
  checkTimeConflict: (existingSlots, newSlot) => {
    const newStart = new Date(newSlot.start_time);
    const newEnd = new Date(newSlot.end_time);
    
    return existingSlots.some(slot => {
      const existingStart = new Date(slot.start_time);
      const existingEnd = new Date(slot.end_time);
      
      return (newStart < existingEnd && newEnd > existingStart);
    });
  }
};

export default timeslotService; 