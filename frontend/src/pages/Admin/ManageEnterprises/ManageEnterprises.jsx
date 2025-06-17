import React, { useState, useEffect } from 'react';
import SearchBar from '../../../components/common/SearchBar';
import Select from '../../../components/common/Select';
import { HiOfficeBuilding, HiMail, HiPhone, HiGlobeAlt, HiTag, HiUser } from 'react-icons/hi';
import { useDialog } from '../../../components/common';
import { getEnterprises, searchEnterprises, approveEnterprise, updateEnterpriseStatus } from '../../../services/adminService';

const ManageEnterprises = () => {
  const { showDialog, DialogComponent } = useDialog();
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch enterprises from API
  const fetchEnterprises = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Fetching enterprises from API...');
      const response = await getEnterprises({ limit: 1000 });
      console.log('📊 API Response:', response);
      
      const enterprisesData = response.data.enterprises.map(enterprise => ({
        id: enterprise.enterprise_id,
        name: enterprise.name,
        type: enterprise.enterprise_type || 'Chưa cập nhật',
        contact_person: enterprise.contact_person || 'Chưa cập nhật',
        email: enterprise.email || 'Chưa cập nhật',
        phone: enterprise.phone || 'Chưa cập nhật',
        website: enterprise.website || 'Chưa cập nhật',
        status: enterprise.status || 'active'
      }));
      
      console.log('🏢 Processed enterprises:', enterprisesData);
      console.log('⏳ Enterprises awaiting approval:', enterprisesData.filter(e => e.status === 'inactive'));
      
      setEnterprises(enterprisesData);
      setSearchResults(enterprisesData);
      
      // Apply status filter if set
      if (statusFilter) {
        const filtered = enterprisesData.filter(enterprise => enterprise.status === statusFilter);
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('❌ Error fetching enterprises:', error);
      setError('Không thể tải danh sách doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterprises();
  }, []);

  // Effect để apply filter khi statusFilter thay đổi
  useEffect(() => {
    if (statusFilter === '') {
      setSearchResults(enterprises);
    } else {
      const filtered = enterprises.filter(enterprise => enterprise.status === statusFilter);
      setSearchResults(filtered);
    }
  }, [statusFilter, enterprises]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults(enterprises);
      return;
    }

    try {
      const response = await searchEnterprises(query);
      const enterprisesData = response.data.map(enterprise => ({
        id: enterprise.id,
        name: enterprise.name,
        type: enterprise.type || 'Chưa cập nhật',
        contact_person: enterprise.contact_person || 'Chưa cập nhật',
        email: enterprise.email || 'Chưa cập nhật',
        phone: enterprise.phone || 'Chưa cập nhật',
        website: enterprise.website || 'Chưa cập nhật',
        status: enterprise.status || 'active'
      }));
      setSearchResults(enterprisesData);
    } catch (error) {
      console.error('Error searching enterprises:', error);
      // Fallback to client-side filtering if API search fails
      const results = enterprises.filter(
        (enterprise) =>
          enterprise.name.toLowerCase().includes(query.toLowerCase()) ||
          enterprise.email.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    }
  };



  // Duyệt hàng loạt doanh nghiệp
  const handleBatchApprove = () => {
    if (selectedEnterprises.length === 0) {
      alert('Vui lòng chọn ít nhất một doanh nghiệp để duyệt');
      return;
    }

    const pendingEnterprises = selectedEnterprises.filter(enterprise => enterprise.status === 'inactive');
    if (pendingEnterprises.length === 0) {
      alert('Không có doanh nghiệp nào cần duyệt trong danh sách đã chọn');
      return;
    }

    showDialog({
      type: 'confirm',
      title: 'Xác nhận duyệt doanh nghiệp',
      message: `Bạn có chắc chắn muốn duyệt ${pendingEnterprises.length} doanh nghiệp đã chọn?`,
      onConfirm: async () => {
        try {
          // Gọi API để duyệt từng doanh nghiệp
          for (const enterprise of pendingEnterprises) {
            await approveEnterprise(enterprise.id);
          }
          
          // Cập nhật state local
          setEnterprises(enterprises.map(enterprise =>
            pendingEnterprises.some(selected => selected.id === enterprise.id)
              ? { ...enterprise, status: 'active' }
              : enterprise
          ));
          setSearchResults(searchResults.map(enterprise =>
            pendingEnterprises.some(selected => selected.id === enterprise.id)
              ? { ...enterprise, status: 'active' }
              : enterprise
          ));
          setSelectedEnterprises([]);
          alert(`Duyệt ${pendingEnterprises.length} doanh nghiệp thành công`);
        } catch (error) {
          alert('Lỗi khi duyệt doanh nghiệp: ' + error.message);
        }
      }
    });
  };

  const handleLock = () => {
    if (selectedEnterprises.length === 0) {
      alert('Vui lòng chọn ít nhất một doanh nghiệp để khóa');
      return;
    }

    showDialog({
      type: 'confirm',
      title: 'Xác nhận khóa doanh nghiệp',
      message: 'Bạn có chắc chắn muốn khóa những doanh nghiệp đã chọn?',
      onConfirm: async () => {
        try {
          // Gọi API để khóa từng doanh nghiệp
          for (const enterprise of selectedEnterprises) {
            await updateEnterpriseStatus(enterprise.id, 'inactive');
          }
          
          // Cập nhật state local
          setEnterprises(enterprises.map(enterprise =>
            selectedEnterprises.some(selected => selected.id === enterprise.id)
              ? { ...enterprise, status: 'inactive' }
              : enterprise
          ));
          setSearchResults(searchResults.map(enterprise =>
            selectedEnterprises.some(selected => selected.id === enterprise.id)
              ? { ...enterprise, status: 'inactive' }
              : enterprise
          ));
          setSelectedEnterprises([]);
          alert('Khóa doanh nghiệp thành công');
        } catch (error) {
          alert('Lỗi khi khóa doanh nghiệp: ' + error.message);
        }
      }
    });
  };

  const handleUnlock = () => {
    if (selectedEnterprises.length === 0) {
      alert('Vui lòng chọn ít nhất một doanh nghiệp để mở khóa');
      return;
    }

    showDialog({
      type: 'confirm',
      title: 'Xác nhận mở khóa doanh nghiệp',
      message: 'Bạn có chắc chắn muốn mở khóa những doanh nghiệp đã chọn?',
              onConfirm: async () => {
          try {
            // Gọi API để mở khóa từng doanh nghiệp
            for (const enterprise of selectedEnterprises) {
              await updateEnterpriseStatus(enterprise.id, 'active');
            }
            
            // Cập nhật state local
            setEnterprises(enterprises.map(enterprise =>
              selectedEnterprises.some(selected => selected.id === enterprise.id)
                ? { ...enterprise, status: 'active' }
                : enterprise
            ));
            setSearchResults(searchResults.map(enterprise =>
              selectedEnterprises.some(selected => selected.id === enterprise.id)
                ? { ...enterprise, status: 'active' }
                : enterprise
            ));
            setSelectedEnterprises([]);
            alert('Mở khóa doanh nghiệp thành công');
          } catch (error) {
            alert('Lỗi khi mở khóa doanh nghiệp: ' + error.message);
          }
        }
    });
  };

  const handleDelete = () => {
    if (selectedEnterprises.length === 0) {
      alert('Vui lòng chọn ít nhất một doanh nghiệp để xóa');
      return;
    }

    showDialog({
      type: 'confirm',
      title: 'Xác nhận xóa doanh nghiệp',
      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn những doanh nghiệp đã chọn? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          // TODO: Implement API call to delete enterprises
          
          // Cập nhật state local
          const remainingEnterprises = enterprises.filter(enterprise =>
            !selectedEnterprises.some(selected => selected.id === enterprise.id)
          );
          setEnterprises(remainingEnterprises);
          setSearchResults(remainingEnterprises.filter(enterprise =>
            enterprise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            enterprise.email.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          setSelectedEnterprises([]);
          alert('Xóa doanh nghiệp thành công');
        } catch (error) {
          alert('Lỗi khi xóa doanh nghiệp: ' + error.message);
        }
      }
    });
  };

  const renderEnterpriseItem = (enterprise) => {
    const getStatusDisplay = (status) => {
      switch (status) {
        case 'active':
          return { text: 'Đã duyệt', class: 'bg-green-100 text-green-800' };
        case 'inactive':
          return { text: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' };
        default:
          return { text: 'Không xác định', class: 'bg-gray-100 text-gray-800' };
      }
    };

    const statusDisplay = getStatusDisplay(enterprise.status);
    
    return (
      <div className="flex flex-col w-full py-2">
        <div className="flex items-center">
          <HiOfficeBuilding className="mr-2 text-gray-600" />
          <span className="font-medium">{enterprise.name}</span>
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${statusDisplay.class}`}>
            {statusDisplay.text}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <HiTag className="mr-2" />
          <span>{enterprise.type || 'Chưa cập nhật'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <HiUser className="mr-2" />
          <span>{enterprise.contact_person || 'Chưa cập nhật'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <HiMail className="mr-2" />
          <span>{enterprise.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <HiPhone className="mr-2" />
          <span>{enterprise.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <HiGlobeAlt className="mr-2" />
          {enterprise.website !== 'Chưa cập nhật' ? (
            <a href={enterprise.website} target="_blank" rel="noopener noreferrer" 
               className="text-blue-600 hover:text-blue-800">
              {enterprise.website}
            </a>
          ) : (
            <span>{enterprise.website}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Quản lý doanh nghiệp</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 h-full flex flex-col">
        {/* Search and action buttons */}
        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          <div className="flex-grow">
            <SearchBar
              placeholder="Tìm kiếm doanh nghiệp..."
              onSearch={handleSearch}
              autoFocus
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="inactive">Chờ duyệt</option>
            <option value="active">Đã duyệt</option>
          </select>
          <button
            onClick={handleBatchApprove}
            disabled={selectedEnterprises.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedEnterprises.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-200 hover:bg-green-300'
            }`}
          >
            Duyệt doanh nghiệp
          </button>
          <button
            onClick={handleLock}
            disabled={selectedEnterprises.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedEnterprises.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-200 hover:bg-purple-300'
            }`}
          >
            Khóa doanh nghiệp
          </button>
          <button
            onClick={handleUnlock}
            disabled={selectedEnterprises.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedEnterprises.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-200 hover:bg-purple-300'
            }`}
          >
            Mở khóa doanh nghiệp
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedEnterprises.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedEnterprises.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-200 hover:bg-purple-300'
            }`}
          >
            Xóa doanh nghiệp
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-md flex-shrink-0">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchEnterprises}
              className="mt-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Enterprise list */}
        <div className="flex-1 min-h-0">
          <div 
            className="pr-2 overflow-y-auto"
            style={{ 
              height: 'calc(100vh - 100px)'
            }}
          >
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải danh sách doanh nghiệp...</p>
              </div>
            ) : (
              <Select
                items={searchResults}
                renderItem={renderEnterpriseItem}
                getItemKey={(enterprise) => enterprise.id}
                onItemSelect={setSelectedEnterprises}
                multiSelect={true}
                selectedItems={selectedEnterprises}
                title="Danh sách doanh nghiệp"
                selectAllLabel="Chọn tất cả"
                emptyMessage={
                  searchQuery ? 'Không tìm thấy doanh nghiệp nào' : 'Chưa có doanh nghiệp nào'
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

export default ManageEnterprises;
