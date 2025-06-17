import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

/**
 * Component để hiển thị thông tin chi tiết của một sự kiện.
 * Được sử dụng trong cả EventManager và EventViewer
 * @param {Object} props
 * @param {'leader'|'member'} props.variant - Biến thể hiển thị (leader hoặc member)
 * @param {Object} props.eventDetails - Thông tin chi tiết sự kiện
 * @param {string} props.className - Custom class
 * @param {Function} props.onConfirmParticipation - Handler khi thành viên xác nhận tham gia
 * @param {Function} props.onDeleteEvent - Handler khi leader xóa sự kiện
 * @param {boolean} props.showDeleteButton - Có hiển thị nút xóa không
 */
const Event = ({
  variant = 'leader',
  eventDetails,
  className = '',
  onConfirmParticipation,
  onDeleteEvent,
  showDeleteButton = false
}) => {
  // Màu sắc dựa trên variant
  const getStyles = () => {
    if (variant === 'leader') {
      return {
        headerBg: 'bg-purple-50',
        headerBorder: 'border-purple-100',
        cellBg: 'bg-purple-100'
      };
    }
    return {
      headerBg: 'bg-blue-50',
      headerBorder: 'border-blue-100',
      cellBg: 'bg-blue-50'
    };
  };
  
  const styles = getStyles();

  return (
    <div className={`bg-white rounded-md shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`p-4 ${styles.headerBg} border-b ${styles.headerBorder} relative`}>
        <h2 className="text-xl font-bold text-gray-800">Thông tin sự kiện</h2>
        <p className="text-sm text-gray-600 mt-1">
          Thông tin chi tiết về sự kiện được tạo cho nhóm của bạn
        </p>
        
        {/* Nút xóa sự kiện */}
        {showDeleteButton && onDeleteEvent && (
          <button
            onClick={onDeleteEvent}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors group"
            title="Xóa sự kiện"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Event Information Table */}
      <table className="w-full border-collapse">
        <tbody>
          <tr className="border-t border-b">
            <td className={`py-3 px-4 ${styles.cellBg} font-medium`}>Tên</td>
            <td className="py-3 px-4">{eventDetails.name || 'Chưa có thông tin'}</td>
          </tr>
          <tr className="border-b">
            <td className={`py-3 px-4 ${styles.cellBg} font-medium`}>Địa điểm</td>
            <td className="py-3 px-4">{eventDetails.location || 'Chưa có thông tin'}</td>
          </tr>
          <tr className="border-b">
            <td className={`py-3 px-4 ${styles.cellBg} font-medium`}>Thời gian</td>
            <td className="py-3 px-4">{eventDetails.time || 'Chưa có thông tin'}</td>
          </tr>
          <tr className="border-b">
            <td className={`py-3 px-4 ${styles.cellBg} font-medium`}>Loại địa điểm</td>
            <td className="py-3 px-4">{eventDetails.locationType || 'Chưa có thông tin'}</td>
          </tr>
          <tr className="border-b">
            <td className={`py-3 px-4 ${styles.cellBg} font-medium`}>Tỉ lệ phù hợp</td>
            <td className="py-3 px-4 flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: eventDetails.matchRate || '0%' }}
                ></div>
              </div>
              {eventDetails.matchRate || '0%'}
            </td>
          </tr>
          <tr className="border-b">
            <td className={`py-3 px-4 ${styles.cellBg} font-medium`}>Xác nhận đặt chỗ</td>
            <td className="py-3 px-4">{eventDetails.bookingStatus || 'Chưa đặt'}</td>
          </tr>
          <tr className="border-b">
            <td className={`py-3 px-4 ${styles.cellBg} font-medium`}>Trạng thái thông báo</td>
            <td className="py-3 px-4">{eventDetails.notificationStatus || 'Chưa thông báo'}</td>
          </tr>
          <tr className="border-b">
            <td className={`py-3 px-4 ${styles.cellBg} font-medium`}>Thành viên xác nhận tham gia</td>
            <td className="py-3 px-4">{eventDetails.attendeeCount || 1}</td>
          </tr>
        </tbody>
      </table>

      {/* Member Confirm Button */}
      {variant === 'member' && onConfirmParticipation && (
        <div className="p-4 flex justify-center">
          <button 
            onClick={onConfirmParticipation}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition-colors"
          >
            Xác nhận tham gia
          </button>
        </div>
      )}
    </div>
  );
};

export default Event;