import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../../components/common/Modal';
import SearchBar from '../../../components/common/SearchBar';
import { getUserGroups, createGroup, deleteGroup } from '../../../services/groupService';
import { HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';


const GroupList = () => {
  const navigate = useNavigate();
  
  // State for managing groups data
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // State for the selected group (for deletion)
  const [selectedGroup, setSelectedGroup] = useState(null);

  // State for handling modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State for new group information
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: ''
  });
  
  // Function to fetch user groups
  const fetchGroups = async () => {
    console.log('🔄 Đang tải danh sách nhóm...');
    const response = await getUserGroups();
    console.log('📥 Response từ getUserGroups:', response);
    if (response.success) {
      console.log('✅ Cập nhật danh sách nhóm:', response.data);
      setGroups(response.data);
      setFilteredGroups(response.data);
    } else {
      console.error('❌ Lỗi khi tải nhóm:', response.message);
    }
  };
  
  // Fetch user groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // Function to handle creating a new group
  const handleCreateGroup = async () => {
    console.log('🔄 Đang tạo nhóm...');
    const response = await createGroup({
      name: newGroup.name || `Nhóm ${groups.length + 1}`,
      description: newGroup.description
    });
    console.log('📥 Response từ createGroup:', response);

    if (response.success) {
      console.log('✅ Tạo nhóm thành công, đang tải lại danh sách...');
      // Gọi lại fetchGroups để cập nhật danh sách từ server
      await fetchGroups();
      setIsCreateModalOpen(false);
      setNewGroup({ name: '', description: '' });
    } else {
      console.error('❌ Lỗi tạo nhóm:', response.message);
      alert('Không thể tạo nhóm: ' + response.message);
    }
  };

  // Function to handle group deletion
  const handleDeleteGroup = async () => {
    if (selectedGroup) {
      const response = await deleteGroup(selectedGroup.id);
      
      if (response.success) {
        const updatedGroups = groups.filter(group => group.id !== selectedGroup.id);
        setGroups(updatedGroups);
        setFilteredGroups(updatedGroups.filter(group =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase())
        ));
        setIsDeleteModalOpen(false);
        setSelectedGroup(null);
      } else {
        alert('Không thể xóa nhóm: ' + response.message);
      }
    }
  };

  // Function to handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.status.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  };

  // Function to handle delete button click
  const handleDeleteClick = (group, event) => {
    event.stopPropagation(); // Prevent row selection
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };  // Function to handle selecting a group
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };
  
  // Function to handle double click on a group - routes to appropriate view based on user's role in the group
  const handleGroupDoubleClick = (group) => {
    // If the user is the leader of the group, navigate to the leader view
    if (group.isLeader) {
      navigate(`/groups/${group.id}/event-manager`);
    } else {
      // If the user is a regular member, navigate to the member view
      navigate(`/groups/${group.id}/member/event-viewer`);
    }
  };

  // Function to handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && selectedGroup) {
        setIsDeleteModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedGroup]);



  return (
    <div className="flex flex-col h-screen bg-white p-6 group-list-container">
      {/* Mobile title */}
      <div className="md:hidden mb-4 text-center mobile-title">
        <h1 className="text-lg font-semibold text-gray-800">Danh sách nhóm</h1>
      </div>
      
      {/* Header with title and create button */}
      <div className="flex justify-between items-center mb-6 group-list-header">
        <div className="flex items-center">
          <div className="mr-3 text-purple-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Lịch trình thông minh</h1>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo nhóm
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          placeholder="Tìm kiếm nhóm theo tên hoặc trạng thái..."
          onSearch={handleSearch}
          className="max-w-md"
        />
      </div>

      {/* Groups table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse">          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-left font-medium text-gray-700">Tên nhóm</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Số thành viên</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Ngày tạo</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Trạng thái nhóm</th>
              <th className="py-3 px-4 text-center font-medium text-gray-700">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 px-4 text-center text-gray-500">
                  {searchQuery ? 'Không tìm thấy nhóm nào phù hợp' : 'Bạn chưa tham gia nhóm nào'}
                </td>
              </tr>
            ) : (
              filteredGroups.map((group) => (
                <tr 
                  key={group.id} 
                  className={`border-b hover:bg-gray-50 cursor-pointer ${selectedGroup?.id === group.id ? 'bg-gray-100' : ''}`}
                  onClick={() => handleGroupSelect(group)}
                  onDoubleClick={() => handleGroupDoubleClick(group)}
                >
                  <td className="py-3 px-4">{group.name}</td>
                  <td className="py-3 px-4">{group.memberCount}</td>
                  <td className="py-3 px-4">{group.createdDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {group.status}
                      {group.isLeader && (
                        <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded">
                          Trưởng nhóm
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => handleDeleteClick(group, e)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      title="Rời khỏi nhóm"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Group Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <div className="p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Tạo nhóm mới</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
              />
            </div>
            

            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                key="cancel-button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                key="create-button"
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Group Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4 text-red-600">Rời khỏi nhóm</h2>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Bạn có chắc chắn muốn rời khỏi nhóm này không?
            </p>
            
            {selectedGroup && (
              <div className="bg-gray-50 p-4 rounded border">
                <p className="font-medium text-gray-800">
                  Tên nhóm: {selectedGroup.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Số thành viên: {selectedGroup.memberCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Trạng thái: {selectedGroup.status}
                </p>
                {selectedGroup.isLeader && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Bạn là trưởng nhóm. Rời khỏi nhóm sẽ xóa nhóm này!
                  </p>
                )}
              </div>
            )}
            
            <p className="text-sm text-red-600 mt-3">
              ⚠️ Hành động này không thể hoàn tác!
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteGroup}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              {selectedGroup?.isLeader ? 'Xóa nhóm' : 'Rời nhóm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupList;
