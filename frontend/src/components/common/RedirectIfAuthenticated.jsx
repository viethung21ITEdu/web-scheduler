import React from 'react';
import { Navigate } from 'react-router-dom';

const RedirectIfAuthenticated = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Nếu đã đăng nhập, redirect về trang phù hợp
  if (token && user.user_id) {
    if (user.role === 'Enterprise') {
      return <Navigate to="/enterprise" replace />;
    } else if (user.role === 'Admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default RedirectIfAuthenticated; 