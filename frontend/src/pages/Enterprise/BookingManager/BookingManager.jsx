import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed'

  // Fetch bookings data
  useEffect(() => {
    fetchBookings();
  }, []);

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

  // Filter bookings based on status
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'pending') return booking.status === 'pending';
    if (filter === 'confirmed') return booking.status === 'confirmed';
    return true;
  });

  // Handle booking confirmation
  const handleConfirmBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/enterprises/bookings/${bookingId}`, 
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBookings(); // Refresh data
      alert('Xác nhận đặt chỗ thành công!');
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Có lỗi xảy ra khi xác nhận đặt chỗ.');
    }
  };

  // Handle booking rejection
  const handleRejectBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/enterprises/bookings/${bookingId}`, 
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBookings(); // Refresh data
      alert('Từ chối đặt chỗ thành công!');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Có lỗi xảy ra khi từ chối đặt chỗ.');
    }
  };

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Header area */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h1 className="text-xl font-semibold text-gray-800">Quản lý đặt chỗ</h1>
        <p className="text-sm text-gray-600">Quản lý lịch đặt chỗ của các nhóm</p>
      </div>
      
      {/* Bookings content */}
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Danh sách đặt chỗ</h2>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 rounded-lg transition ${filter === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button 
                className={`px-3 py-1 rounded-lg transition ${filter === 'pending' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setFilter('pending')}
              >
                Chờ xác nhận
              </button>
              <button 
                className={`px-3 py-1 rounded-lg transition ${filter === 'confirmed' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setFilter('confirmed')}
              >
                Đã xác nhận
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-4 text-left">Người đặt</th>
                    <th className="py-3 px-4 text-left">Sự kiện</th>
                    <th className="py-3 px-4 text-center">Số người</th>
                    <th className="py-3 px-4 text-center">Thời gian đặt</th>
                    <th className="py-3 px-4 text-left">Ghi chú</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking.booking_id} 
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onDoubleClick={() => handleBookingClick(booking)}
                    >
                      <td className="py-3 px-4 text-left">
                        <div className="font-medium">{booking.booker_name || 'Chưa có tên'}</div>
                        <div className="text-xs text-gray-500">{booking.booker_phone || 'Chưa có SĐT'}</div>
                        <div className="text-xs text-gray-400">{booking.booker_email || 'Chưa có email'}</div>
                      </td>
                      <td className="py-3 px-4 text-left">
                        <div className="text-sm">{booking.event_name}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm">{booking.number_of_people} người</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="text-sm">{booking.booking_time || 'Chưa xác định'}</div>
                      </td>
                      <td className="py-3 px-4 text-left">
                        <div className="text-sm">{booking.notes || '-'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`py-1 px-3 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'confirmed' ? 'Đã xác nhận' : 
                           booking.status === 'pending' ? 'Chờ xác nhận' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {booking.status === 'pending' && (
                          <div className="flex item-center justify-center space-x-3">
                            <button 
                              onClick={() => handleConfirmBooking(booking.booking_id)}
                              className="transform hover:text-green-500 hover:scale-110"
                              title="Xác nhận"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleRejectBooking(booking.booking_id)}
                              className="transform hover:text-red-500 hover:scale-110"
                              title="Từ chối"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            {/* Close button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal header */}
            <h2 className="text-xl font-bold mb-4 text-center">Chi tiết đặt chỗ</h2>

            {/* Detail table */}
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Người đặt</td>
                  <td className="py-2">
                    <div>{selectedBooking.booker_name || 'Chưa có tên'}</div>
                    <div className="text-sm text-gray-600">{selectedBooking.booker_phone || 'Chưa có SĐT'}</div>
                    <div className="text-sm text-gray-500">{selectedBooking.booker_email || 'Chưa có email'}</div>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Sự kiện</td>
                  <td className="py-2">{selectedBooking.event_name}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Số lượng người tham gia</td>
                  <td className="py-2">{selectedBooking.number_of_people} người</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Thời gian đặt</td>
                  <td className="py-2">{selectedBooking.booking_time || 'Chưa xác định'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Ghi chú</td>
                  <td className="py-2">{selectedBooking.notes || "Không có"}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-semibold">Trạng thái</td>
                  <td className="py-2">
                    <span className={`py-1 px-2 rounded-full text-xs ${
                      selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedBooking.status === 'confirmed' ? 'Đã xác nhận' : 
                       selectedBooking.status === 'pending' ? 'Chờ xác nhận' : 'Đã hủy'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6 flex justify-center">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Trở về
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManager;
