import React from 'react';

/**
 * Reusable component cho phép cập nhật thông tin vị trí trong nhóm.
 * @param {object} props - Props của component
 * @param {string} props.location - Vị trí hiện tại
 * @param {function} props.onLocationChange - Hàm xử lý khi vị trí thay đổi
 * @param {boolean} props.isDisabled - Nếu true, input sẽ bị disabled
 * @param {string} props.className - Custom class cho container 
 */
const UpdateLocation = ({ location, onLocationChange, isDisabled = false, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-sm font-medium mb-2">Nhập vị trí</label>
      <input
        type="text"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        disabled={isDisabled}
        className={`
          w-full p-2 rounded-md
          border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-purple-300
          ${isDisabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100'}
        `}
        placeholder="Nhập địa chỉ hoặc vị trí của bạn"
      />
    </div>
  );
};

export default UpdateLocation;