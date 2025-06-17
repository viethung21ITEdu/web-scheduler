import React, { useState, useEffect } from 'react';
import SearchBar from '../../../components/common/SearchBar';
import Select from '../../../components/common/Select';
import { HiUserGroup, HiUser, HiCalendar, HiLocationMarker } from 'react-icons/hi';

import { useDialog } from '../../../components/common';
import { getGroups, batchUpdateGroupStatus, batchDeleteGroups } from '../../../services/adminService';

const ManageGroups = () => {
  const { showDialog, DialogComponent } = useDialog();
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getGroups({ limit: 1000 });
      const groupsData = response.data.groups.map(group => ({
        id: group.group_id,
        name: group.name,
        leader: group.leader_name || group.leader_username || 'Chưa có',
        memberCount: group.member_count || 0,
        createdAt: group.created_at,
        location: 'Chưa cập nhật', // Có thể thêm field location vào DB sau
        status: group.status || 'active'
      }));
      setGroups(groupsData);
      setSearchResults(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const results = groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.leader.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleLock = () => {
    if (selectedGroups.length === 0) {
      alert('Vui lòng chọn ít nhất một nhóm để khóa');
      return;
    }

    showDialog({
      type: 'confirm',
      title: 'Xác nhận khóa nhóm',
      message: 'Bạn có chắc chắn muốn khóa những nhóm đã chọn?',
      onConfirm: async () => {
        try {
          const groupIds = selectedGroups.map(group => group.id);
          await batchUpdateGroupStatus(groupIds, 'inactive');
          
          // Cập nhật state local
          setGroups(groups.map(group =>
            selectedGroups.some(selected => selected.id === group.id)
              ? { ...group, status: 'inactive' }
              : group
          ));
          setSearchResults(searchResults.map(group =>
            selectedGroups.some(selected => selected.id === group.id)
              ? { ...group, status: 'inactive' }
              : group
          ));
          setSelectedGroups([]);
          alert('Khóa nhóm thành công');
        } catch (error) {
          alert('Lỗi khi khóa nhóm: ' + error.message);
        }
      }
    });
  };

  const handleUnlock = () => {
    if (selectedGroups.length === 0) {
      alert('Vui lòng chọn ít nhất một nhóm để mở khóa');
      return;
    }

    showDialog({
      type: 'confirm',
      title: 'Xác nhận mở khóa nhóm',
      message: 'Bạn có chắc chắn muốn mở khóa những nhóm đã chọn?',
      onConfirm: async () => {
        try {
          const groupIds = selectedGroups.map(group => group.id);
          await batchUpdateGroupStatus(groupIds, 'active');
          
          // Cập nhật state local
          setGroups(groups.map(group =>
            selectedGroups.some(selected => selected.id === group.id)
              ? { ...group, status: 'active' }
              : group
          ));
          setSearchResults(searchResults.map(group =>
            selectedGroups.some(selected => selected.id === group.id)
              ? { ...group, status: 'active' }
              : group
          ));
          setSelectedGroups([]);
          alert('Mở khóa nhóm thành công');
        } catch (error) {
          alert('Lỗi khi mở khóa nhóm: ' + error.message);
        }
      }
    });
  };

  const handleDelete = () => {
    if (selectedGroups.length === 0) {
      alert('Vui lòng chọn ít nhất một nhóm để xóa');
      return;
    }

    showDialog({
      type: 'confirm',
      title: 'Xác nhận xóa nhóm',
      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn những nhóm đã chọn? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          const groupIds = selectedGroups.map(group => group.id);
          await batchDeleteGroups(groupIds);
          
          // Cập nhật state local
          const remainingGroups = groups.filter(group =>
            !selectedGroups.some(selected => selected.id === group.id)
          );
          setGroups(remainingGroups);
          setSearchResults(remainingGroups.filter(group =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.leader.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          setSelectedGroups([]);
          alert('Xóa nhóm thành công');
        } catch (error) {
          alert('Lỗi khi xóa nhóm: ' + error.message);
        }
      }
    });
  };

  const renderGroupItem = (group) => {
    return (
      <div className="flex items-center w-full py-2">
        <div className="flex-grow">
          <div className="flex items-center">
            <HiUserGroup className="mr-2 text-gray-600" />
            <span className="font-medium">{group.name}</span>
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              group.status === 'inactive' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {group.status === 'inactive' ? 'Đã khóa' : 'Đang hoạt động'}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <HiUser className="mr-1" />
            <span>Trưởng nhóm: {group.leader}</span>
            <span className="mx-1">•</span>
            <span>{group.memberCount} thành viên</span>
            <span className="mx-1">•</span>
            <HiCalendar className="mr-1 ml-1" />
            <span>Ngày tạo: {new Date(group.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Quản lý nhóm</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 h-full flex flex-col">
        {/* Search and action buttons */}
        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          <div className="flex-grow">
            <SearchBar
              placeholder="Tìm kiếm nhóm..."
              onSearch={handleSearch}
              autoFocus
            />
          </div>
          <button
            onClick={handleLock}
            disabled={selectedGroups.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedGroups.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-200 hover:bg-purple-300'
            }`}
          >
            Khóa nhóm
          </button>
          <button
            onClick={handleUnlock}
            disabled={selectedGroups.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedGroups.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-200 hover:bg-purple-300'
            }`}
          >
            Mở khóa nhóm
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedGroups.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedGroups.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-200 hover:bg-purple-300'
            }`}
          >
            Xóa nhóm
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-md flex-shrink-0">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchGroups}
              className="mt-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Group list */}
        <div className="flex-1 min-h-0">
          <div 
            className="pr-2 overflow-y-auto"
            style={{ 
              height: 'calc(100vh - 150px)'
            }}
          >
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải danh sách nhóm...</p>
              </div>
            ) : (
              <Select
                items={searchResults}
                renderItem={renderGroupItem}
                getItemKey={(group) => group.id}
                onItemSelect={setSelectedGroups}
                multiSelect={true}
                selectedItems={selectedGroups}
                title="Danh sách nhóm"
                selectAllLabel="Chọn tất cả"
                emptyMessage={
                  searchQuery ? 'Không tìm thấy nhóm nào' : 'Chưa có nhóm nào'
                }
              />
            )}
          </div>
        </div>
      </div>
      <DialogComponent />
    </div>
  );
};

export default ManageGroups;
