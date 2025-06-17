import axios from 'axios';

const API_BASE_URL = '/api';

const bookingService = {
  // Tạo booking mới
  createBooking: async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo booking:', error);
      throw error;
    }
  },

  // Lấy danh sách booking của user hiện tại
  getMyBookings: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách booking:', error);
      throw error;
    }
  },

  // Lấy danh sách enterprises để chọn
  getEnterprises: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/bookings/enterprises`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách enterprises:', error);
      throw error;
    }
  },

  // Hủy booking
  cancelBooking: async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi hủy booking:', error);
      throw error;
    }
  },

  // Cập nhật booking
  updateBooking: async (bookingId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật booking:', error);
      throw error;
    }
  },

  // Lấy danh sách booking của một sự kiện
  getEventBookings: async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách booking của sự kiện:', error);
      throw error;
    }
  }
};

export default bookingService; 