export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    LOGOUT: '/users/logout',
    REFRESH: '/users/refresh',
    PROFILE: '/users/profile'
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password'
  },

  // Groups
  GROUPS: {
    BASE: '/groups',
    BY_ID: (id) => `/groups/${id}`,
    MEMBERS: (id) => `/groups/${id}/members`,
    JOIN: (id) => `/groups/${id}/join`,
    LEAVE: (id) => `/groups/${id}/leave`
  },

  // Events
  EVENTS: {
    BASE: '/events',
    BY_ID: (id) => `/events/${id}`,
    BY_GROUP: (groupId) => `/events?group_id=${groupId}`
  },

  // Bookings
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id) => `/bookings/${id}`,
    BY_EVENT: (eventId) => `/bookings?event_id=${eventId}`
  },

  // Enterprises
  ENTERPRISES: {
    BASE: '/enterprises',
    BY_ID: (id) => `/enterprises/${id}`,
    POSTS: (id) => `/enterprises/${id}/posts`
  }
};
