// filepath: e:\web-doan-third\web-doan-cnpm\src\components\common\Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {  // Định nghĩa các biến thể của button
  const variants = {
    primary: 'bg-primary text-black hover:bg-primary-dark',
    'primary-light': 'bg-primary-light text-black hover:bg-primary-light/90',
    secondary: 'bg-white text-primary border border-primary hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    ghost: 'bg-transparent text-primary hover:bg-gray-100'
  };
  
  // Định nghĩa kích thước
  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-6',
    lg: 'py-3 px-8 text-lg'
  };
  
  // Xác định class dựa vào props
  const buttonClasses = `
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95'}
    transition-all duration-200 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 shadow-md
    ${className}
  `;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Biến thể Button tròn
export const RoundButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  // Button tròn với icon hoặc text ngắn
  return (
    <Button
      type={type}
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={`rounded-full ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default Button;