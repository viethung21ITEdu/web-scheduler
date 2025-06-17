import api from './api';

export const authService = {
  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', {
        username: credentials.username, // Backend expects username field
        password: credentials.password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  },

  // Đăng ký
  register: async (userData) => {
    try {
      console.log('🚀 API call to /users/register with:', userData);
      const response = await api.post('/users/register', userData);
      console.log('✅ API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Register error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      throw new Error(errorMessage);
    }
  },

  // Đăng ký (alias cho register)
  signup: async (userData) => {
    return await authService.register(userData);
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra đã đăng nhập
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Lấy token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email khôi phục');
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (email, resetCode, newPassword) => {
    try {
      const response = await api.post('/users/reset-password', { 
        email,
        resetCode,
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu');
    }
  }
};
