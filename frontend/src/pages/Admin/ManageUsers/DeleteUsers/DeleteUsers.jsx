import React, { useState } from 'react';
import SearchBar from '../../../../components/common/SearchBar';
import Select from '../../../../components/common/Select';
import { HiMail, HiUser } from 'react-icons/hi';
import { searchUsers, updateUserStatus, batchDeleteUsers } from '../../../../services/adminService';

/**
 * Component for searching and deleting users
 */
const DeleteUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle search submission
  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setError('Từ khóa tìm kiếm phải có ít nhất 2 ký tự');
      return;
    }

    setSearchQuery(query);
    setIsSearching(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Searching users with query:', query);
      const response = await searchUsers(query);
      console.log('✅ Search results:', response);

      if (response.success) {
        // Transform data to match component format
        const transformedResults = response.data.map(user => ({
          id: user.user_id,
          name: user.full_name || user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          username: user.username
        }));
        setSearchResults(transformedResults);
      } else {
        throw new Error(response.message || 'Lỗi khi tìm kiếm');
      }
    } catch (error) {
      console.error('❌ Error searching users:', error);
      setError(error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (selected) => {
    setSelectedUsers(selected);
  };

  // Render each user item in the select component
  const renderUserItem = (user) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'inactive': return 'bg-red-100 text-red-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <HiUser className="mr-2 text-gray-600" />
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
              {user.status === 'active' ? 'Hoạt động' : 
               user.status === 'inactive' ? 'Đã khóa' : 
               user.status === 'pending' ? 'Chờ duyệt' : user.status}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {user.role}
            </span>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <HiMail className="mr-2" />
          <span>{user.email}</span>
          {user.username && (
            <>
              <span className="mx-2">•</span>
              <span>@{user.username}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  // Handle lock button click
  const handleLock = async () => {
    if (selectedUsers.length === 0) {
      setError('Vui lòng chọn ít nhất một người dùng để khóa');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      console.log('🔒 Locking users:', selectedUsers);
      
      // Update status to inactive for each selected user
      const promises = selectedUsers.map(user => 
        updateUserStatus(user.id, 'inactive')
      );
      
      await Promise.all(promises);
      
      setSuccess(`Đã khóa thành công ${selectedUsers.length} người dùng`);
      setSelectedUsers([]);
      
      // Refresh search results
      if (searchQuery) {
        handleSearch(searchQuery);
      }
      
    } catch (error) {
      console.error('❌ Error locking users:', error);
      setError(error.message);
    }
  };

  // Handle unlock button click
  const handleUnlock = async () => {
    if (selectedUsers.length === 0) {
      setError('Vui lòng chọn ít nhất một người dùng để mở khóa');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      console.log('🔓 Unlocking users:', selectedUsers);
      
      // Update status to active for each selected user
      const promises = selectedUsers.map(user => 
        updateUserStatus(user.id, 'active')
      );
      
      await Promise.all(promises);
      
      setSuccess(`Đã mở khóa thành công ${selectedUsers.length} người dùng`);
      setSelectedUsers([]);
      
      // Refresh search results
      if (searchQuery) {
        handleSearch(searchQuery);
      }
      
    } catch (error) {
      console.error('❌ Error unlocking users:', error);
      setError(error.message);
    }
  };

  // Handle delete button click
  const handleDelete = async () => {
    if (selectedUsers.length === 0) {
      setError('Vui lòng chọn ít nhất một người dùng để xóa');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn những người dùng đã chọn?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      console.log('🗑️ Deleting users:', selectedUsers);
      
      const userIds = selectedUsers.map(user => user.id);
      const response = await batchDeleteUsers(userIds);
      
      if (response.success) {
        setSuccess(response.message);
        setSelectedUsers([]);
        
        // Refresh search results
        if (searchQuery) {
          handleSearch(searchQuery);
        }
      } else {
        throw new Error(response.message || 'Lỗi khi xóa người dùng');
      }
      
    } catch (error) {
      console.error('❌ Error deleting users:', error);
      setError(error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Title */}
      <div className="mb-6">
        <h2>Tìm kiếm</h2>
      </div>

      {/* Search section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Error and Success messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        {/* Search bar and action buttons */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-grow">
            <SearchBar 
              placeholder="Thanh tìm kiếm" 
              onSearch={handleSearch} 
              autoFocus
              className="w-full bg-gray-200 rounded-lg"
            />
          </div>
          
          {/* Show selected count */}
          {selectedUsers.length > 0 && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md">
              Đã chọn: {selectedUsers.length} người dùng
            </span>
          )}
          
          <button
            onClick={handleLock}
            disabled={selectedUsers.length === 0}
            className={`px-6 py-2 rounded-md transition-colors ${
              selectedUsers.length === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-orange-200 hover:bg-orange-300 text-orange-800'
            }`}
          >
            Khóa người dùng
          </button>
          <button
            onClick={handleUnlock}
            disabled={selectedUsers.length === 0}
            className={`px-6 py-2 rounded-md transition-colors ${
              selectedUsers.length === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-green-200 hover:bg-green-300 text-green-800'
            }`}
          >
            Mở khóa người dùng
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedUsers.length === 0}
            className={`px-6 py-2 rounded-md transition-colors ${
              selectedUsers.length === 0
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-red-200 hover:bg-red-300 text-red-800'
            }`}
          >
            Xóa người dùng
          </button>
        </div>

        {/* Select component */}
        <Select
          items={searchResults}
          renderItem={renderUserItem}
          getItemKey={(user) => user.id}
          onItemSelect={handleUserSelect}
          multiSelect={true}
          selectedItems={selectedUsers}
          title="Danh sách tìm được"
          selectAllLabel="Chọn tất cả"
          emptyMessage={
            isSearching ? 'Đang tìm kiếm...' : 
            searchQuery ? 'Không tìm thấy kết quả nào' : 'Nhập từ khóa để tìm kiếm'
          }
          className="bg-gray-200"
        />
      </div>
    </div>
  );
};

export default DeleteUsers;
