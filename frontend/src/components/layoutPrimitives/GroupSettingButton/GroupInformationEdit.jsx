import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupById, updateGroup } from '../../../services/groupService';

/**
 * Component xem/chỉnh sửa thông tin nhóm
 * - Leader: có thể chỉnh sửa thông tin nhóm
 * - Member: chỉ có thể xem thông tin nhóm (chế độ chỉ đọc)
 * 
 * @param {boolean} isOpen - Trạng thái hiển thị của cửa sổ
 * @param {function} onClose - Hàm được gọi khi đóng cửa sổ
 * @param {string} groupId - ID của nhóm
 * @param {boolean} isLeader - Người dùng có phải leader không
 */
const GroupInformationEdit = ({ isOpen, onClose, groupId, isLeader = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [groupData, setGroupData] = useState({
    name: '',
    description: ''
  });
  const [originalData, setOriginalData] = useState({
    name: '',
    description: ''
  });

  // Tải thông tin nhóm khi mở popup
  useEffect(() => {
    if (isOpen && groupId) {
      loadGroupData();
    }
  }, [isOpen, groupId]);

  // Debug
  console.log('GroupInformationEdit render:', { isOpen, groupId, isLeader });
  
  // Nếu cửa sổ không được mở thì không hiển thị gì
  if (!isOpen) return null;



  // Tải thông tin nhóm
  const loadGroupData = async () => {
    setLoading(true);
    try {
      const response = await getGroupById(groupId);
      if (response.success) {
        const data = {
          name: response.data.name || '',
          description: response.data.description || ''
        };
        setGroupData(data);
        setOriginalData(data);
      } else {
        alert('Không thể tải thông tin nhóm: ' + response.message);
        onClose();
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin nhóm:', error);
      alert('Có lỗi xảy ra khi tải thông tin nhóm');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi click ra ngoài cửa sổ
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setGroupData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Kiểm tra có thay đổi không
  const hasChanges = () => {
    return groupData.name !== originalData.name || 
           groupData.description !== originalData.description;
  };

  // Xử lý lưu thông tin
  const handleSave = async () => {
    if (!hasChanges()) {
      onClose();
      return;
    }

    if (!groupData.name.trim()) {
      alert('Tên nhóm không được để trống');
      return;
    }

    setSaving(true);
    try {
      const response = await updateGroup(groupId, {
        name: groupData.name.trim(),
        description: groupData.description.trim()
      });

      if (response.success) {
        alert('Cập nhật thông tin nhóm thành công');
        onClose();
        // Reload trang để cập nhật thông tin mới
        window.location.reload();
      } else {
        alert('Không thể cập nhật thông tin: ' + response.message);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[100]"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-[500px] overflow-hidden p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isLeader ? 'Chỉnh sửa thông tin nhóm' : 'Thông tin nhóm'}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        ) : (
          <>
            {/* Tên nhóm */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nhóm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${!isLeader ? 'bg-gray-50 text-gray-700' : ''}`}
                value={groupData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên nhóm"
                maxLength={100}
                readOnly={!isLeader}
                disabled={!isLeader}
              />
            </div>

            {/* Mô tả nhóm */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả nhóm
              </label>
              <textarea
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${!isLeader ? 'bg-gray-50 text-gray-700' : ''}`}
                rows={4}
                value={groupData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={isLeader ? "Nhập mô tả nhóm (tùy chọn)" : "Không có mô tả"}
                maxLength={500}
                readOnly={!isLeader}
                disabled={!isLeader}
              />
              <div className="text-xs text-gray-500 mt-1">
                {groupData.description.length}/500 ký tự
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {isLeader ? 'Hủy' : 'Đóng'}
              </button>
              {isLeader && (
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges()}
                  className="px-4 py-2 bg-purple-400 text-black rounded-md hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupInformationEdit;
