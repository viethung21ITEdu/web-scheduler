import api from './api';

// Gửi thông báo sự kiện qua email
export const sendEventNotification = async (eventId, customContent = null) => {
  try {
    const response = await api.post(`/notifications/events/${eventId}/send`, {
      customContent
    });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending event notification:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo'
    };
  }
};

// Test email service
export const testEmailService = async () => {
  try {
    const response = await api.get('/notifications/test-email');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error testing email service:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Có lỗi xảy ra khi test email service'
    };
  }
}; 