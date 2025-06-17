import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../../components/common/Logo';
import Input from '../../../components/common/Input';
import { RoundButton } from '../../../components/common/Button';
import { authService } from '../../../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'success'
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const handleFormChange = (e) => {
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

  const validateEmailForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors = {};
    
    if (!formData.resetCode.trim()) {
      newErrors.resetCode = 'Mã khôi phục là bắt buộc';
    } else if (formData.resetCode.length !== 6 || !/^\d+$/.test(formData.resetCode)) {
      newErrors.resetCode = 'Mã khôi phục phải có 6 chữ số';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setStep('code');
    } catch (error) {
      console.error('Lỗi quên mật khẩu:', error);
      setErrors({
        email: error.message || 'Có lỗi xảy ra khi gửi email khôi phục'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateResetForm()) {
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(email, formData.resetCode, formData.newPassword);
      setStep('success');
    } catch (error) {
      console.error('Lỗi reset mật khẩu:', error);
      setErrors({
        resetCode: error.message || 'Có lỗi xảy ra khi đặt lại mật khẩu'
      });
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute top-8 left-8 hidden md:block">
          <Link to="/">
            <Logo size="default" />
          </Link>
        </div>

        <div className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold text-center mb-4">Đặt lại mật khẩu thành công!</h1>
            
            <p className="text-gray-600 mb-6">
              Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            
            <RoundButton 
              onClick={() => navigate('/login')}
              variant="primary-light" 
              size="lg"
              className="w-full md:w-auto"
            >
              Đăng nhập ngay
            </RoundButton>
          </div>
        </div>
      </div>
    );
  }

  // Code input screen
  if (step === 'code') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute top-8 left-8 hidden md:block">
          <Link to="/">
            <Logo size="default" />
          </Link>
        </div>

        <div className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-6">NHẬP MÃ KHÔI PHỤC</h1>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm text-center">
                Chúng tôi đã gửi mã khôi phục 6 chữ số đến email <strong>{email}</strong>. 
                Vui lòng kiểm tra hộp thư và nhập mã bên dưới.
              </p>
            </div>
            
            <form onSubmit={handleResetSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Mã khôi phục</label>
                <Input
                  type="text"
                  name="resetCode"
                  value={formData.resetCode}
                  onChange={handleFormChange}
                  placeholder="Nhập mã 6 chữ số"
                  error={errors.resetCode}
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Mật khẩu mới</label>
                <Input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleFormChange}
                  placeholder="Nhập mật khẩu mới"
                  error={errors.newPassword}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Xác nhận mật khẩu</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  placeholder="Nhập lại mật khẩu mới"
                  error={errors.confirmPassword}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-6 flex justify-center">
                <RoundButton 
                  type="submit"
                  variant="primary-light" 
                  size="lg"
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </RoundButton>
              </div>
            </form>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">
                Không nhận được mã?{' '}
                <button
                  onClick={() => setStep('email')}
                  className="text-primary hover:underline font-medium"
                >
                  Gửi lại
                </button>
              </p>
              
              <Link
                to="/login"
                className="text-primary hover:underline hover:text-primary-dark hover:scale-105 hover:drop-shadow-sm transition-all duration-200 font-medium"
              >
                ← Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email input screen (default)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute top-8 left-8 hidden md:block">
        <Link to="/">
          <Logo size="default" />
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md">
          <h1 className="text-xl md:text-2xl font-bold text-center mb-6">QUÊN MẬT KHẨU</h1>
          
          <p className="text-gray-600 text-center mb-6">
            Nhập email của bạn và chúng tôi sẽ gửi mã khôi phục mật khẩu.
          </p>
          
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Email</label>
              <Input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Nhập email của bạn"
                error={errors.email}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="mb-6 flex justify-center">
              <RoundButton 
                type="submit"
                variant="primary-light" 
                size="lg"
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
              </RoundButton>
            </div>
          </form>

          <div className="text-center">
            <p className="text-gray-600 text-sm md:text-base">
              Nhớ lại mật khẩu?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline hover:text-primary-dark hover:scale-105 hover:drop-shadow-sm transition-all duration-200 font-medium"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 