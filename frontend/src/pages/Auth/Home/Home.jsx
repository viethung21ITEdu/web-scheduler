// filepath: e:\web-doan-third\web-doan-cnpm\src\pages\Auth\Home\Home.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import HomeBackground from '../../../assets/images/HomeBackground.jpg';
import Logo from '../../../components/common/Logo';
import { RoundButton } from '../../../components/common/Button';

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Chỉ phần này có màu nền tím nhạt */}
      <header className="w-full flex justify-between items-center px-4 md:px-6 py-4 bg-primary-light relative">
        <div>
          <Link to="/" className="text-black font-bold text-xl px-2 md:px-5">NHÓM 6</Link>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex">
          <Link 
            to="/about-us" 
            className="text-black hover:opacity-90 px-6 py-2 font-medium mx-1 bg-white/30"
          >
            VỀ CHÚNG MÌNH
          </Link>
          <Link 
            to="/enterprise-auth" 
            className="text-black hover:opacity-90 px-6 py-2 font-medium mx-1 bg-white/30"
          >
            DOANH NGHIỆP
          </Link>
          <Link 
            to="/login" 
            className="text-black hover:opacity-90 px-6 py-2 font-medium mx-1 bg-white/30"
          >
            ĐĂNG NHẬP
          </Link>
          <Link 
            to="/signup"
            className="text-black hover:opacity-90 px-6 py-2 font-medium mx-1 bg-white/30"
          >
            ĐĂNG KÝ
          </Link>
        </div>

        {/* Mobile navigation */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-primary-light z-50 md:hidden">
            <Link 
              to="/about-us" 
              className="block text-black hover:bg-white/30 px-6 py-3 font-medium border-b border-white/20"
              onClick={() => setMenuOpen(false)}
            >
              VỀ CHÚNG MÌNH
            </Link>
            <Link 
              to="/enterprise-auth" 
              className="block text-black hover:bg-white/30 px-6 py-3 font-medium border-b border-white/20"
              onClick={() => setMenuOpen(false)}
            >
              DOANH NGHIỆP
            </Link>
            <Link 
              to="/login" 
              className="block text-black hover:bg-white/30 px-6 py-3 font-medium border-b border-white/20"
              onClick={() => setMenuOpen(false)}
            >
              ĐĂNG NHẬP
            </Link>
            <Link 
              to="/signup"
              className="block text-black hover:bg-white/30 px-6 py-3 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              ĐĂNG KÝ
            </Link>
          </div>
        )}
      </header>
      
      {/* Main Content - Ảnh nền với nội dung đè lên */}
      <main 
        className="flex-grow relative"
        style={{
          backgroundImage: `url(${HomeBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Nội dung đặt đè lên ảnh nền */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 py-10 z-10">
          <div className="mb-6">
            <Logo size="default" />
          </div>
          
          <h1 className="text-black text-3xl md:text-5xl font-bold mb-6 md:mb-10 leading-tight">
            Giải pháp quản lý<br />
            lịch nhóm dễ dàng
          </h1>
          
          <div className="mt-4">
            <Link to="/login">
              <RoundButton variant="primary-light" size="lg" className="w-full md:w-auto">
                TẠO NHÓM NGAY
              </RoundButton>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;