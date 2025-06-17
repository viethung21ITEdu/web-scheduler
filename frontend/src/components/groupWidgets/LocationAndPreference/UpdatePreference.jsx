import React from 'react';

/**
 * Reusable component cho phép cập nhật sở thích trong nhóm.
 * @param {object} props - Props của component
 * @param {Array<{id: string, label: string}>} props.preferenceOptions - Danh sách các sở thích có thể chọn
 * @param {object} props.preferences - Object chứa trạng thái của các sở thích
 * @param {function} props.onPreferenceChange - Hàm được gọi khi có sự thay đổi sở thích
 * @param {boolean} props.isDisabled - Nếu true, các checkbox sẽ bị disabled
 * @param {string} props.className - Custom class cho container
 */
const UpdatePreference = ({
  preferenceOptions,
  preferences,
  onPreferenceChange,
  isDisabled = false,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium mb-2">Chọn sở thích</label>
      <div className={`
        bg-gray-200 rounded-md p-4 max-h-64 overflow-y-auto
        ${isDisabled ? 'bg-gray-100' : ''}
      `}>
        <div className="grid grid-cols-1 gap-2">
          {preferenceOptions.map(option => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                id={option.id}
                checked={preferences[option.id] || false}
                onChange={() => onPreferenceChange(option.id)}
                disabled={isDisabled}
                className={`
                  w-4 h-4 text-purple-600 border-gray-300 rounded
                  focus:ring-purple-500
                  ${isDisabled ? 'cursor-not-allowed' : ''}
                `}
              />
              <label 
                htmlFor={option.id} 
                className={`ml-2 text-sm ${isDisabled ? 'text-gray-500' : ''}`}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdatePreference;