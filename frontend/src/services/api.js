import axios from 'axios';

// Sử dụng localhost cho backend
const API_URL = 'http://localhost:5000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors - CHỈ redirect khi đã có token (user đã login)
    // Không redirect khi đang trong quá trình login
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const token = localStorage.getItem('token');
      
      // Chỉ redirect khi:
      // 1. Có token (nghĩa là đã login trước đó)
      // 2. Không phải đang ở trang login/signup
      if (token && !currentPath.includes('/login') && !currentPath.includes('/signup')) {
        console.log('🔒 Token expired, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location = '/login';
      } else {
        console.log('⚠️ 401 during login attempt, not redirecting');
      }
    }
    return Promise.reject(error);
  }
);

export default api;