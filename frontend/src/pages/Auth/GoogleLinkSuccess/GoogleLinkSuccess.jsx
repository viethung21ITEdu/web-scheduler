import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleLinkSuccess = () => {
  const location = useLocation();

  useEffect(() => {
    const processLinkSuccess = () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userString = urlParams.get('user');

        if (token && userString) {
          // Parse user data
          const userData = JSON.parse(decodeURIComponent(userString));
          
          // Cập nhật token và user data trong localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));

          // Dispatch event để các component khác biết user data đã thay đổi
          window.dispatchEvent(new CustomEvent('userDataUpdated', { 
            detail: { userData, emailUpdated: true } 
          }));

          // Thông báo cho parent window (nếu đây là popup)
          if (window.opener) {
            // Cũng dispatch event cho parent window
            window.opener.dispatchEvent(new CustomEvent('userDataUpdated', { 
              detail: { userData, emailUpdated: true } 
            }));
            
            console.log('🔔 GoogleLinkSuccess sending postMessage...');
            window.opener.postMessage({
              type: 'GOOGLE_LINK_SUCCESS',
              data: { token, userData, emailUpdated: true }
            }, '*');
            
            // Đóng popup sau 1 giây
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            // Nếu không phải popup, hiển thị thông báo và tự động đóng
            setTimeout(() => {
              window.close();
            }, 2000);
          }
        } else {
          // Không có token hoặc user data
          console.error('Missing token or user data from Google link callback');
          if (window.opener) {
            window.opener.postMessage({
              type: 'GOOGLE_LINK_ERROR',
              error: 'Missing token or user data'
            }, '*');
          }
          setTimeout(() => {
            window.close();
          }, 1000);
        }
      } catch (error) {
        console.error('Error processing Google link callback:', error);
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_LINK_ERROR',
            error: error.message
          }, '*');
        }
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    };

    processLinkSuccess();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Liên kết thành công!</h2>
        <p className="text-gray-500 mb-3">Google Account đã được liên kết với tài khoản của bạn</p>
        
        {/* Hiển thị thông tin email đã cập nhật */}
        {(() => {
          try {
            const urlParams = new URLSearchParams(location.search);
            const userString = urlParams.get('user');
            if (userString) {
              const userData = JSON.parse(decodeURIComponent(userString));
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-800">
                    <strong>Email đã được cập nhật:</strong><br/>
                    {userData.email}
                  </p>
                </div>
              );
            }
          } catch (error) {
            // Ignore error
          }
          return null;
        })()}
        
        <p className="text-sm text-gray-400">Cửa sổ này sẽ tự động đóng...</p>
      </div>
    </div>
  );
};

export default GoogleLinkSuccess; 