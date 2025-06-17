import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [updateLoading, setUpdateLoading] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, activeFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/enterprises/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
      alert('Có lỗi xảy ra khi tải danh sách đặt chỗ.');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (activeFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === activeFilter));
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setUpdateLoading(prev => ({ ...prev, [bookingId]: true }));
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/enterprises/bookings/${bookingId}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh data
      await fetchBookings();
      alert(`${status === 'confirmed' ? 'Xác nhận' : 'Từ chối'} đặt chỗ thành công!`);
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái.');
    } finally {
      setUpdateLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã xác nhận' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };



  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-800">Quản lý đặt chỗ</h1>
        <p className="text-sm text-gray-600">Quản lý lịch đặt chỗ của các nhóm</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Filter buttons */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-800 mb-3">Danh sách đặt chỗ</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chờ xác nhận
              </button>
              <button
                onClick={() => setActiveFilter('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === 'confirmed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã xác nhận
              </button>
            </div>
          </div>

          {/* Bookings table */}
          <div className="overflow-x-auto">
            {filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Không có đặt chỗ nào {activeFilter !== 'all' ? `ở trạng thái "${activeFilter}"` : ''}.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người đặt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian nhận thông tin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.booker_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.event_name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {booking.number_of_people} người
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {booking.booking_time || 'Chưa xác định'}
                        </div>
                        {booking.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {booking.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-4 py-4">
                        {booking.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateBookingStatus(booking.booking_id, 'confirmed')}
                              disabled={updateLoading[booking.booking_id]}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Xác nhận đặt chỗ"
                            >
                              {updateLoading[booking.booking_id] ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.booking_id, 'cancelled')}
                              disabled={updateLoading[booking.booking_id]}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Từ chối đặt chỗ"
                            >
                              {updateLoading[booking.booking_id] ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                        {booking.status !== 'pending' && (
                          <span className="text-sm text-gray-400">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingManager; 