import api from './api';

const enterpriseService = {
  // Lấy profile doanh nghiệp hiện tại
  getMyProfile: async () => {
    try {
      const response = await api.get('/enterprises/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật profile doanh nghiệp
  updateMyProfile: async (profileData) => {
    try {
      const response = await api.put('/enterprises/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách tiện nghi có sẵn
  getAvailableFacilities: () => {
    return [
      'Wifi',
      'Điều hòa',
      'Máy chiếu',
      'Bàn ghế nhóm',
      'Phòng họp riêng',
      'Bãi đỗ xe',
      'Máy in',
      'Bảng viết',
      'Âm thanh',
      'Camera an ninh',
      'Thang máy',
      'Toilet riêng',
      'Khu vực hút thuốc',
      'Máy pha cà phê',
      'Tủ lạnh',
      'Lò vi sóng'
    ];
  }
};

export default enterpriseService; 