/**
 * Cấu hình API endpoints
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000', // Server backend
  ENDPOINTS: {
    USERS: '/api/users',
    PROFILE: '/api/users/profile/me',
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register'
  }
};

// Helper function để lấy token từ localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function để tạo auth headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}; 