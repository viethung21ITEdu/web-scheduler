import React from 'react';

const GoogleSignUpButton = ({ onLoading }) => {
  const handleGoogleSignUp = () => {
    // Hiển thị thông báo xác nhận
    const confirmed = window.confirm(
      'Bạn sẽ đăng ký tài khoản bằng Google.\n\n' +
      'Hệ thống sẽ tự động tạo tài khoản mới bằng thông tin Google của bạn.\n\n' +
      'Bạn có muốn tiếp tục?'
    );
    
    if (!confirmed) {
      return; // User hủy, không làm gì
    }
    
    if (onLoading) onLoading(true);
    
    // Debug API URL
    console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL);
    const targetURL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`;
    console.log('🔍 Target URL:', targetURL);
    
    // Redirect đến backend Google OAuth endpoint
    window.location.href = targetURL;
  };

  return (
    <button
      onClick={handleGoogleSignUp}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 font-medium text-gray-700 shadow-md"
    >
      {/* Google Icon */}
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      
      <span>Đăng ký với Google</span>
    </button>
  );
};

export default GoogleSignUpButton; 