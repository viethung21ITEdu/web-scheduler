import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Kiểm tra xem user có đăng nhập không
  if (!token || !user.user_id) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role nếu được yêu cầu
  if (requiredRole && user.role !== requiredRole) {
    // Redirect về trang phù hợp với role hiện tại
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

export default ProtectedRoute; 