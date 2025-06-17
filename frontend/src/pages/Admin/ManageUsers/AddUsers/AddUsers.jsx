import React, { useState } from 'react';
import { HiPlus, HiX, HiOutlineTrash, HiEye, HiEyeOff } from 'react-icons/hi';
import { batchAddUsers } from '../../../../services/adminService';

const AddUsers = () => {
  const [emailList, setEmailList] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');
  const [defaultRole, setDefaultRole] = useState('Member');
  const [showPassword, setShowPassword] = useState(false);
  const [userEmails, setUserEmails] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Xử lý khi thêm email vào danh sách
  const handleAddEmails = () => {
    if (!emailList.trim()) {
      setError('Vui lòng nhập email người dùng');
      return;
    }

    // Tách danh sách email bằng dấu xuống dòng hoặc dấu phẩy
    const emails = emailList
      .split(/[\n,]/)
      .map(email => email.trim())
      .filter(email => email !== '');

    // Kiểm tra định dạng email
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    
    if (invalidEmails.length > 0) {
      setError(`Các email không hợp lệ: ${invalidEmails.join(', ')}`);
      return;
    }

    // Thêm email vào danh sách
    setUserEmails([...new Set([...userEmails, ...emails])]);
    setEmailList('');
    setError('');
  };

  // Kiểm tra định dạng email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Xóa một email khỏi danh sách
  const handleRemoveEmail = (emailToRemove) => {
    setUserEmails(userEmails.filter(email => email !== emailToRemove));
  };

  // Xóa tất cả email khỏi danh sách
  const handleClearEmails = () => {
    setUserEmails([]);
  };

  // Thêm người dùng vào hệ thống
  const handleAddUsers = async () => {
    if (userEmails.length === 0) {
      setError('Vui lòng thêm ít nhất một email');
      return;
    }

    if (!defaultPassword) {
      setError('Vui lòng nhập mật khẩu mặc định');
      return;
    }

    try {
      setIsAdding(true);
      setError('');
      setSuccess('');
      
      console.log('🚀 Adding users:', { emails: userEmails, password: '***', role: defaultRole });
      
      const response = await batchAddUsers(userEmails, defaultPassword, defaultRole);
      console.log('✅ Batch add response:', response);
      
      if (response.success) {
        const { success_count, error_count, errors } = response.data;
        
        let message = `Đã thêm thành công ${success_count} người dùng`;
        if (error_count > 0) {
          message += `. ${error_count} lỗi: ${errors.slice(0, 3).join(', ')}`;
          if (errors.length > 3) {
            message += ` và ${errors.length - 3} lỗi khác`;
          }
        }
        
        setSuccess(message);
        setUserEmails([]);
        setDefaultPassword('');
        setDefaultRole('Member');
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi thêm người dùng');
      }
      
    } catch (error) {
      console.error('❌ Error adding users:', error);
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  // Xử lý hủy thao tác
  const handleCancel = () => {
    setUserEmails([]);
    setEmailList('');
    setDefaultPassword('');
    setDefaultRole('Member');
    setError('');
    setSuccess('');
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Thêm người dùng</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column for email input */}
        <div className="flex-1">
          <div className="mb-4">
            <label htmlFor="emailList" className="block text-sm font-medium text-gray-700 mb-1">
              Nhập email người dùng
            </label>
            <textarea
              id="emailList"
              value={emailList}
              onChange={(e) => setEmailList(e.target.value)}
              placeholder="Nhập danh sách email, mỗi email một dòng hoặc phân cách bằng dấu phẩy"
              className="w-full h-72 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mỗi email một dòng hoặc phân cách bằng dấu phẩy
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleAddEmails}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              disabled={isAdding}
            >
              <HiPlus className="mr-1" />
              Thêm vào danh sách
            </button>
          </div>
        </div>
        
        {/* Right column for password and user list */}
        <div className="flex-1 flex flex-col">
          {/* Default password input */}
          <div className="mb-4">
            <label htmlFor="defaultPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nhập mật khẩu mặc định
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="defaultPassword"
                value={defaultPassword}
                onChange={(e) => setDefaultPassword(e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <HiEyeOff className="h-5 w-5" />
                ) : (
                  <HiEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Default role selection */}
          <div className="mb-4">
            <label htmlFor="defaultRole" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn quyền mặc định
            </label>
            <select
              id="defaultRole"
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="Member">Thành viên (Member)</option>
              <option value="Enterprise">Doanh nghiệp (Enterprise)</option>
              <option value="Admin">Quản trị viên (Admin)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Tất cả người dùng được tạo sẽ có quyền này
            </p>
          </div>
          
          {/* Email list display */}
          <div className="flex-1 bg-gray-50 p-4 border border-gray-200 rounded-md overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">Danh sách email ({userEmails.length})</h3>
              {userEmails.length > 0 && (
                <button 
                  onClick={handleClearEmails}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {userEmails.map((email, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-200"
                >
                  <span className="text-sm">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <HiX />
                  </button>
                </div>
              ))}
              {userEmails.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có email nào trong danh sách
                </p>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isAdding}
            >
              Hủy
            </button>
            <button
              onClick={handleAddUsers}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              disabled={isAdding || userEmails.length === 0 || !defaultPassword || !defaultRole}
            >
              {isAdding ? 'Đang thêm...' : 'Thêm người dùng'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
          {success}
        </div>
      )}
    </div>
  );
};

export default AddUsers;
