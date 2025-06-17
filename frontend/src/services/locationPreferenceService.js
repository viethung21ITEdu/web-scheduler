import api from './api';
import SuggestionService from './suggestionService';

const locationPreferenceService = {
  // Lấy location và preferences của user trong một group
  getUserLocationPreferences: async (groupId) => {
    try {
      console.log(`🌐 API Call: GET /groups/${groupId}/location-preferences`);
      const response = await api.get(`/groups/${groupId}/location-preferences`);
      console.log('✅ Kết quả lấy location preferences:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy location preferences:', error);
      throw error;
    }
  },

  // Lưu location và preferences của user trong một group
  saveUserLocationPreferences: async (groupId, data) => {
    try {
      console.log(`🌐 API Call: POST/PUT /groups/${groupId}/location-preferences`);
      console.log('📤 Data gửi lên:', data);
      
      const response = await api.post(`/groups/${groupId}/location-preferences`, data);
      console.log('✅ Kết quả lưu location preferences:', response.data);
      
      // Xóa cache suggestions cho nhóm này vì dữ liệu đã thay đổi
      if (response.data.success) {
        SuggestionService.clearSuggestionsCache(groupId);
        console.log('🗑️ Đã xóa cache suggestions do cập nhật location/preferences');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lưu location preferences:', error);
      throw error;
    }
  },

  // Lấy location và preferences của tất cả thành viên trong group
  getGroupLocationPreferences: async (groupId) => {
    try {
      console.log(`🌐 API Call: GET /groups/${groupId}/all-location-preferences`);
      const response = await api.get(`/groups/${groupId}/all-location-preferences`);
      console.log('✅ Kết quả lấy group location preferences:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy group location preferences:', error);
      throw error;
    }
  }
};

export default locationPreferenceService; 