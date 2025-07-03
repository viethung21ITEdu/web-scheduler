// filepath: e:\web-doan-third\web-doan-cnpm\src\pages\Auth\SignUp\SignUp.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../../components/common/Logo';
import Input from '../../../components/common/Input';
import { RoundButton } from '../../../components/common/Button';
import GoogleSignUpButton from '../../../components/common/GoogleSignUpButton';
import { authService } from '../../../services/authService';
import { validateUsername, validateEmail, validatePhone, validatePassword } from '../../../utils/validation';

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('register'); // 'register' | 'verify-email' | 'success'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
    if (errors.verificationCode) {
      setErrors({
        ...errors,
        verificationCode: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Kiểm tra tên người dùng với validation mới
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      newErrors.username = usernameError;
    }
    
    // Kiểm tra email với validation mới
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Kiểm tra số điện thoại với validation mới
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    // Kiểm tra mật khẩu với validation mới
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Kiểm tra xác nhận mật khẩu
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      // Bước 1: Gửi mã xác thực email (nếu có email)
      if (formData.email && formData.email.trim()) {
        await authService.sendEmailVerification(formData.email, formData.username);
        setStep('verify-email');
        setErrors({});
      } else {
        // Nếu không có email, đăng ký trực tiếp
        await registerUser();
      }
    } catch (error) {
      setErrors({
        submit: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setErrors({ verificationCode: 'Vui lòng nhập mã xác thực' });
      return;
    }

    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setErrors({ verificationCode: 'Mã xác thực phải có 6 chữ số' });
      return;
    }

    setLoading(true);
    
    try {
      await authService.verifyEmailCode(formData.email, verificationCode);
      setEmailVerified(true);
      await registerUser();
    } catch (error) {
      setErrors({
        verificationCode: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        full_name: formData.username,
        role: 'Member'
      };

      console.log('📤 Sending register data:', registerData);
      const response = await authService.register(registerData);
      console.log('✅ Register response:', response);
      
      setStep('success');
    } catch (error) {
      // Nếu lỗi yêu cầu xác thực email, chuyển về step verify
      if (error.message.includes('Email chưa được xác thực') || 
          error.message.includes('requireEmailVerification')) {
        setStep('verify-email');
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: error.message });
      }
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await authService.resendEmailVerification(formData.email, formData.username);
      alert('Mã xác thực mới đã được gửi đến email của bạn.');
      setErrors({});
    } catch (error) {
      setErrors({
        resend: error.message
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
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h1>
                <p className="text-gray-600">
                  Tài khoản của bạn đã được tạo thành công. 
                  {formData.email && ' Email đã được xác thực.'}
                </p>
              </div>
              
              <div className="mb-6">
                <RoundButton 
                  onClick={() => navigate('/login')}
                  variant="primary-light" 
                  size="lg"
                  className="w-full"
                >
                  Đăng nhập ngay
                </RoundButton>
              </div>
              
              <Link
                to="/"
                className="text-primary hover:underline hover:text-primary-dark transition-all duration-200 font-medium"
              >
                ← Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email verification screen
  if (step === 'verify-email') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute top-8 left-8 hidden md:block">
          <Link to="/">
            <Logo size="default" />
          </Link>
        </div>
        
        <div className="flex-grow flex items-center justify-center px-4 py-8">
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md">
            <h1 className="text-xl md:text-2xl font-bold text-center mb-6">XÁC THỰC EMAIL</h1>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm text-center">
                Chúng tôi đã gửi mã xác thực 6 chữ số đến email <strong>{formData.email}</strong>. 
                Vui lòng kiểm tra hộp thư và nhập mã bên dưới.
              </p>
            </div>
            
            <form onSubmit={handleVerifyEmail}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Mã xác thực</label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={handleVerificationCodeChange}
                  placeholder="Nhập mã 6 chữ số"
                  error={errors.verificationCode}
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                />
              </div>

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {errors.submit}
                </div>
              )}

              {errors.resend && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {errors.resend}
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
                  {loading ? 'Đang xác thực...' : 'Xác thực email'}
                </RoundButton>
              </div>
            </form>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">
                Không nhận được mã?{' '}
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-primary hover:underline font-medium disabled:opacity-50"
                >
                  Gửi lại
                </button>
              </p>
              
              <button
                onClick={() => setStep('register')}
                className="text-primary hover:underline hover:text-primary-dark transition-all duration-200 font-medium"
              >
                ← Quay lại đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Register form (default)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Logo ở góc trên bên trái - chỉ hiển thị trên desktop */}
      <div className="absolute top-8 left-8 hidden md:block">
        <Link to="/">
          <Logo size="default" />
        </Link>
      </div>
      
      {/* Form đăng ký */}
      <div className="flex-grow flex items-center justify-center px-4 py-8 md:py-0 md:px-0">
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md backdrop-blur-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <h1 className="text-xl md:text-2xl font-bold text-center mb-6">ĐĂNG KÝ</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Tên người dùng</label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên người dùng của bạn"
                error={errors.username}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
                error={errors.email}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Số điện thoại</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại của bạn"
                error={errors.phone}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Mật khẩu</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tạo mật khẩu mới"
                error={errors.password}
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Xác nhận mật khẩu</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu xác nhận"
                error={errors.confirmPassword}
              />
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {errors.submit}
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
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </RoundButton>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-xs md:text-sm">hoặc</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Google SignUp Button */}
          <div className="mb-6">
            <GoogleSignUpButton onLoading={setLoading} />
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm md:text-base">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary hover:underline hover:text-primary-dark hover:scale-105 hover:drop-shadow-sm transition-all duration-200 font-medium">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;