import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleLinkError = () => {
  const location = useLocation();

  useEffect(() => {
    const processLinkError = () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(location.search);
        const errorMessage = urlParams.get('message') || 'Liên kết Google Account thất bại';

        // Thông báo cho parent window (nếu đây là popup)
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_LINK_ERROR',
            error: errorMessage
          }, '*');
          
          // Đóng popup sau 3 giây
          setTimeout(() => {
            window.close();
          }, 3000);
        } else {
          // Nếu không phải popup, hiển thị lỗi và tự động đóng
          setTimeout(() => {
            window.close();
          }, 5000);
        }
      } catch (error) {
        console.error('Error processing Google link error:', error);
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_LINK_ERROR',
            error: 'Có lỗi xảy ra khi xử lý liên kết'
          }, '*');
        }
        setTimeout(() => {
          window.close();
        }, 2000);
      }
    };

    processLinkError();
  }, [location]);

  // Parse error message để hiển thị
  const getErrorMessage = () => {
    try {
      const urlParams = new URLSearchParams(location.search);
      return urlParams.get('message') || 'Liên kết Google Account thất bại';
    } catch (error) {
      return 'Có lỗi xảy ra khi liên kết Google Account';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">✗</div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Liên kết thất bại!</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
          <pre className="text-sm text-red-800 whitespace-pre-wrap font-sans">
            {getErrorMessage()}
          </pre>
        </div>
        
        <p className="text-sm text-gray-400">Cửa sổ này sẽ tự động đóng...</p>
      </div>
    </div>
  );
};

export default GoogleLinkError; 