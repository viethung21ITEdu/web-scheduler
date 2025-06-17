import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../../../components/common/Logo';
import Input from '../../../components/common/Input';
import { RoundButton } from '../../../components/common/Button';
import GoogleLoginButton from '../../../components/common/GoogleLoginButton';
import { authService } from '../../../services/authService';

const EnterpriseAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    enterprise_name: '',
    login_identifier: '', // Thay đổi tên field cho đăng nhập
    email: '',
    password: '',
    phone: '',
    enterprise_type: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');

  // Xử lý thông báo từ URL params
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error && message) {
      setLinkMessage(decodeURIComponent(message));
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isLogin) {
      if (!formData.login_identifier.trim()) {
        newErrors.login_identifier = 'Tên đăng nhập hoặc email là bắt buộc';
      }
    } else {
      if (!formData.enterprise_name.trim()) {
        newErrors.enterprise_name = 'Tên doanh nghiệp là bắt buộc';
      }
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }

    if (!isLogin) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Số điện thoại là bắt buộc';
      }

      if (!formData.enterprise_type) {
        newErrors.enterprise_type = 'Loại doanh nghiệp là bắt buộc';
      }

      if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      if (isLogin) {
        // Đăng nhập
        const response = await authService.login({
          username: formData.login_identifier, // Có thể là username hoặc email
          password: formData.password
        });

        if (response.user.role !== 'Enterprise') {
          setErrors({
            password: 'Tài khoản này không phải là tài khoản doanh nghiệp'
          });
          return;
        }

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/enterprise/dashboard');
      } else {
        // Đăng ký
        const signupData = {
          username: formData.enterprise_name,
          email: formData.email,
          password: formData.password,
          full_name: formData.enterprise_name,
          phone: formData.phone,
          enterprise_type: formData.enterprise_type,
          role: 'Enterprise'
        };

        await authService.signup(signupData);
        alert('Đăng ký thành công! Tài khoản doanh nghiệp của bạn đang chờ duyệt từ quản trị viên. Quá trình này có thể mất 1 ngày làm việc.');
        setIsLogin(true);
        setFormData({
          enterprise_name: '',
          login_identifier: '',
          email: '',
          password: '',
          phone: '',
          enterprise_type: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Xử lý các trường hợp lỗi khác nhau
      const errorData = error.response?.data;
      let errorMessage = errorData?.message || error.message || `Đã xảy ra lỗi khi ${isLogin ? 'đăng nhập' : 'đăng ký'}`;
      
      // Xử lý trường hợp đặc biệt cho doanh nghiệp chưa được duyệt
      if (errorData?.status === 'pending_approval') {
        errorMessage = 'Tài khoản doanh nghiệp của bạn đang chờ duyệt. Quá trình này có thể mất 1 ngày làm việc. Vui lòng thử lại sau.';
      } else if (errorData?.status === 'not_approved') {
        errorMessage = 'Tài khoản doanh nghiệp của bạn chưa được kích hoạt. Vui lòng liên hệ quản trị viên.';
      }

      // Hiển thị lỗi ở field password cho cả đăng nhập và đăng ký để nhất quán
      setErrors({
        password: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      enterprise_name: '',
      login_identifier: '',
      email: '',
      password: '',
      phone: '',
      enterprise_type: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Logo ở góc trên bên trái - chỉ hiển thị trên desktop */}
      <div className="absolute top-8 left-8 hidden md:block">
        <Link to="/">
          <Logo size="default" />
        </Link>
      </div>

      {/* Form */}
      <div className="flex-grow flex items-center justify-center px-4 py-8 md:py-0 md:px-0">
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md backdrop-blur-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <h1 className="text-xl md:text-2xl font-bold text-center mb-6">
            {isLogin ? 'ĐĂNG NHẬP DOANH NGHIỆP' : 'ĐĂNG KÝ DOANH NGHIỆP'}
          </h1>
          
          {linkMessage && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
              {linkMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {isLogin ? (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Email/Tên đăng nhập</label>
                <Input
                  type="text"
                  name="login_identifier"
                  value={formData.login_identifier}
                  onChange={handleChange}
                  placeholder="Nhập email hoặc tên đăng nhập"
                  error={errors.login_identifier}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Tên doanh nghiệp</label>
                <Input
                  type="text"
                  name="enterprise_name"
                  value={formData.enterprise_name}
                  onChange={handleChange}
                  placeholder="Nhập tên doanh nghiệp"
                  error={errors.enterprise_name}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            )}

            {!isLogin && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm md:text-base">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Nhập email của doanh nghiệp"
                    error={errors.email}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm md:text-base">Số điện thoại</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    error={errors.phone}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 text-sm md:text-base">Loại doanh nghiệp</label>
                  <select
                    name="enterprise_type"
                    value={formData.enterprise_type}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.enterprise_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="">Chọn loại doanh nghiệp</option>
                    <option value="cafe">Cafe</option>
                    <option value="restaurant">Nhà hàng</option>
                    <option value="library">Thư viện</option>
                    <option value="cinema">Rạp phim</option>
                    <option value="other">Khác</option>
                  </select>
                  {errors.enterprise_type && (
                    <p className="mt-1 text-sm text-red-500">{errors.enterprise_type}</p>
                  )}
                </div>
              </>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Mật khẩu</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                error={errors.password}
                disabled={loading}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
            {isLogin && (
              <div className="flex justify-end mb-4">
                <Link to="/forgot-password" className="text-primary hover:underline hover:text-primary-dark hover:scale-105 hover:drop-shadow-sm transition-all duration-200 text-xs md:text-sm font-medium">
                  Quên mật khẩu?
                </Link>
              </div>
            )}

            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Xác nhận mật khẩu</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  error={errors.confirmPassword}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            )}

            <div className="mb-6 flex justify-center">
              <RoundButton 
                type="submit"
                variant="primary-light" 
                size="lg"
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
              </RoundButton>
            </div>
          </form>

          {/* Divider - chỉ hiển thị khi đăng nhập */}
          {isLogin && (
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-4 text-gray-500 text-xs md:text-sm">hoặc</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>
          )}

          {/* Google Login Button - chỉ hiển thị khi đăng nhập */}
          {isLogin && (
            <div className="mb-6">
              <GoogleLoginButton onLoading={setLoading} isEnterpriseAuth={true} />
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-600 text-sm md:text-base">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
              <button
                onClick={toggleMode}
                className="text-primary hover:underline hover:text-primary-dark hover:scale-105 hover:drop-shadow-sm transition-all duration-200 font-medium"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAuth; 