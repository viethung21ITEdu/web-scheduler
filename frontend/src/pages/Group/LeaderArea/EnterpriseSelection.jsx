import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import bookingService from '../../../services/bookingService';

const EnterpriseSelection = () => {
  const navigate = useNavigate();
  const { groupId, eventId } = useParams();
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState(null);

  useEffect(() => {
    fetchEnterprises();
  }, []);

  const fetchEnterprises = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getEnterprises();
      setEnterprises(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách doanh nghiệp:', error);
      alert('Có lỗi xảy ra khi tải danh sách doanh nghiệp.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEnterprise = (enterprise) => {
    setSelectedEnterprise(enterprise);
  };

  const handleContinue = () => {
    if (!selectedEnterprise) {
      alert('Vui lòng chọn một doanh nghiệp');
      return;
    }
    
    // Chuyển đến trang booking với thông tin enterprise đã chọn
    navigate(`/groups/${groupId}/booking`, {
      state: {
        eventId,
        enterprise: selectedEnterprise
      }
    });
  };

  const getEnterpriseTypeLabel = (type) => {
    const types = {
      cafe: 'Cafe',
      restaurant: 'Nhà hàng',
      library: 'Thư viện',
      cinema: 'Rạp phim',
      other: 'Khác'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải danh sách doanh nghiệp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chọn địa điểm đặt chỗ</h1>
              <p className="text-sm text-gray-600">Chọn doanh nghiệp phù hợp cho sự kiện của bạn</p>
            </div>
            <button
              onClick={() => navigate(`/groups/${groupId}/event-manager`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {enterprises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không có doanh nghiệp nào khả dụng.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterprises.map((enterprise) => (
              <div
                key={enterprise.enterprise_id}
                className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedEnterprise?.enterprise_id === enterprise.enterprise_id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectEnterprise(enterprise)}
              >
                <div className="p-6">
                  {/* Enterprise header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {enterprise.name}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {getEnterpriseTypeLabel(enterprise.enterprise_type)}
                      </span>
                    </div>
                    {selectedEnterprise?.enterprise_id === enterprise.enterprise_id && (
                      <div className="text-primary">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Enterprise details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    {enterprise.address && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{enterprise.address}</span>
                      </div>
                    )}
                    
                    {enterprise.phone && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{enterprise.phone}</span>
                      </div>
                    )}
                    
                    {enterprise.opening_hours && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{enterprise.opening_hours}</span>
                      </div>
                    )}
                    
                    {enterprise.capacity && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Sức chứa: {enterprise.capacity}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue button */}
        {selectedEnterprise && (
          <div className="mt-8 text-center">
            <button
              onClick={handleContinue}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Tiếp tục đặt chỗ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseSelection; 