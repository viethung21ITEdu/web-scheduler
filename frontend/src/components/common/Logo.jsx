// filepath: e:\web-doan-third\web-doan-cnpm\src\components\common\Logo.jsx
import React from 'react';
import LogoClock from '../../assets/images/LogoClock.png';

const Logo = ({ size = 'default', iconOnly = false }) => {
  const sizes = {
    small: {
      container: 'w-12 h-12',
      img: 'w-10 h-10',
      text: 'text-sm'
    },
    default: {
      container: 'w-10 h-10',
      img: 'w-8 h-8',
      text: 'text-base'
    },
    large: {
      container: 'w-12 h-12',
      img: 'w-10 h-10',
      text: 'text-xl'
    }
  };
  
  const currentSize = sizes[size] || sizes.default;
  
  return (
    <div className="flex items-end whitespace-nowrap">
      <div className={`p-1 flex items-center justify-center ${iconOnly ? '' : 'mr-1'} ${currentSize.container}`}>
        <img src={LogoClock} alt="Logo" className={currentSize.img} />
      </div>
      {!iconOnly && (
        <h3 className={`text-black font-semibold ${currentSize.text} mb-1`}>
          Lịch trình thông minh
        </h3>
      )}
    </div>
  );
};

export default Logo;