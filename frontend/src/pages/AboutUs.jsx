import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header cho mobile */}
      <div className="md:hidden bg-primary-light p-4 flex items-center">
        <Link to="/" className="mr-4">
          <Logo size="small" />
        </Link>
        <h1 className="text-xl font-bold">Về Chúng Mình</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-6 md:mb-8 hidden md:block">Về Chúng Mình</h1>
          
          <div className="space-y-6 md:space-y-8">
            <section className="bg-gray-50 p-4 md:p-6 rounded-lg">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-4">Giới thiệu</h2>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Đây là dự án thuộc đồ án môn SE104 - Nhập môn công nghệ phần mềm được thực hiện bởi nhóm 6.
              </p>
            </section>

            <section className="bg-gray-50 p-4 md:p-6 rounded-lg">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-4">Về Web Scheduler</h2>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                Web Scheduler là web để quản lý các sự kiện, đặt lịch hẹn, và quản lý các nhóm.
              </p>
            </section>

            <section className="bg-gray-50 p-4 md:p-6 rounded-lg">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3 md:mb-4">Liên Hệ</h2>
              <div className="space-y-3 text-gray-700 text-sm md:text-base">
                <p className="flex items-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="break-all">Email: 23520571@gm.uit.edu.vn</span>
                </p>
                <p className="flex items-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Địa chỉ: Trường Đại học Công nghệ Thông tin</span>
                </p>
                <p className="flex items-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Điện thoại: (84) 000 000 000</span>
                </p>
              </div>
            </section>
          </div>
          
          {/* Nút trở về trang chủ cho mobile */}
          <div className="mt-6 md:hidden flex justify-center">
            <Link to="/" className="bg-primary-light text-black px-6 py-2 rounded-full font-medium hover:bg-primary-light/80 transition-colors">
              Trở về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 