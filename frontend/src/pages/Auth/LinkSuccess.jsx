import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';

const LinkSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);
  const [processed, setProcessed] = React.useState(false);

  useEffect(() => {
    if (processed) return; // Tránh chạy nhiều lần
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        setProcessed(true); // Đánh dấu đã xử lý
        
        const userData = JSON.parse(decodeURIComponent(userStr));
        
        // Lưu token vào localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
        
        // Cập nhật auth context với user data mới
        login(userData);
        
        // Tự động đóng popup mà không hiển thị alert (để tránh trùng lặp)
        // Alert sẽ được hiển thị bởi parent window
        console.log('🔔 LinkSuccess processing, window.opener:', !!window.opener);
        setTimeout(() => {
          if (window.opener) {
            console.log('🔔 LinkSuccess closing popup...');
            window.close(); // Đóng popup nếu đây là popup
          } else {
            console.log('🔔 LinkSuccess navigating back...');
            navigate(-1); // Quay lại trang trước đó nếu không phải popup
          }
        }, 1000);
        
      } catch (error) {
        setProcessed(true); // Đánh dấu đã xử lý ngay cả khi lỗi
        console.error('Error parsing user data:', error);
        alert('Có lỗi xảy ra khi liên kết tài khoản.');
        navigate('/');
      }
    } else {
      setProcessed(true); // Đánh dấu đã xử lý ngay cả khi không có data
      alert('Thông tin liên kết không hợp lệ.');
      navigate('/');
    }
  }, [searchParams, login, navigate, processed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Đang xử lý liên kết...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkSuccess; 