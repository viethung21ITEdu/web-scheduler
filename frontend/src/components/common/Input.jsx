// filepath: e:\web-doan-third\web-doan-cnpm\src\components\common\Input.jsx
import React, { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const Input = ({ 
  id,
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  name,
  required = false,
  error = '',
  className = '',
  disabled = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}      <div className="relative">
        <input
          id={id}
          name={name}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${type === 'password' ? 'pr-10' : ''} 
            ${className}
          `}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;