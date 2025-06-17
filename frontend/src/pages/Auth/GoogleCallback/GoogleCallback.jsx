import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userString = urlParams.get('user');
        const isEnterpriseAuth = urlParams.get('enterprise_auth') === 'true';
        const nonEnterpriseMessage = urlParams.get('non_enterprise_message');

        if (token && userString) {
          // Parse user data
          const userData = JSON.parse(decodeURIComponent(userString));
          
          // Lưu token vào localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));

          // Dispatch custom event để các component khác biết user đã đăng nhập
          window.dispatchEvent(new Event('userLogin'));

          // Nếu là enterprise auth nhưng user không phải Enterprise
          if (isEnterpriseAuth && nonEnterpriseMessage && userData.role !== 'Enterprise') {
            setMessage(decodeURIComponent(nonEnterpriseMessage));
            setShowMessage(true);
            
            // Sau 3 giây tự động chuyển hướng theo role
            setTimeout(() => {
              redirectByRole(userData);
            }, 3000);
            return;
          }

          // Chuyển hướng bình thường
          redirectByRole(userData);
        } else {
          // Không có token hoặc user data
          console.error('Missing token or user data from Google callback');
          navigate('/login?error=google_auth_failed');
        }
      } catch (error) {
        console.error('Error processing Google callback:', error);
        navigate('/login?error=authentication_failed');
      }
    };

    const redirectByRole = (userData) => {
      // Chuyển hướng dựa vào role
      if (userData.role === 'Member') {
        navigate('/dashboard');
      } else if (userData.role === 'Admin') {
        navigate('/admin');
      } else if (userData.role === 'Enterprise') {
        navigate('/enterprise');
      } else {
        navigate('/dashboard'); // Default
      }
    };

    processCallback();
  }, [location, navigate]);

  if (showMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông báo</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500 mb-4">
            Bạn vẫn được đăng nhập vào hệ thống với tư cách người dùng thường.
          </p>
          <div className="text-sm text-gray-400">
            Chuyển hướng sau 3 giây...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Đang xử lý đăng nhập...</h2>
        <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default GoogleCallback; 