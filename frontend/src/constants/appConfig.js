export const API_BASE_URL = 'http://localhost:5000/api';

export const APP_CONFIG = {
  APP_NAME: 'Web Group Schedule',
  VERSION: '1.0.0',
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  },
  TIMEOUTS: {
    REQUEST_TIMEOUT: 30000, // 30 seconds
    RETRY_TIMEOUT: 5000     // 5 seconds
  }
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  GROUPS: '/groups',
  PROFILE: '/profile',
  ADMIN: '/admin'
};

export const ROLES = {
  ADMIN: 'Admin',
  LEADER: 'Leader', 
  MEMBER: 'Member',
  ENTERPRISE: 'Enterprise'
};

export const STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending', 
  INACTIVE: 'inactive',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled'
};
