import React from 'react';

/**
 * Component hiển thị thông tin chi tiết của thành viên trong nhóm khi hover
 * @param {Object} props - Props của component
 * @param {Object} props.member - Thông tin thành viên
 * @param {string} props.member.name - Tên thành viên
 * @param {string} props.member.email - Email của thành viên
 * @param {string} props.member.role - Vai trò trong nhóm (Trưởng nhóm/Thành viên)
 * @param {boolean} props.isVisible - Trạng thái hiển thị của popup
 * @param {Object} props.position - Vị trí hiển thị popup
 * @param {number} props.position.x - Tọa độ x
 * @param {number} props.position.y - Tọa độ y
 */
const MemberInfor = ({ member, isVisible, position }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute bg-white rounded-lg shadow-lg p-4 z-50 w-72"
      style={{
        top: position.y,
        left: position.x
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-lg">
          {member.name ? member.name.charAt(0) : 'U'}
        </div>
        <div className="flex flex-col">
          <h3 className="font-medium">{member.name}</h3>
          <p className="text-sm text-gray-600">Email: {member.email}</p>
          <p className="text-sm text-gray-600">Role: {member.role}</p>
        </div>
      </div>
    </div>
  );
};

export default MemberInfor;