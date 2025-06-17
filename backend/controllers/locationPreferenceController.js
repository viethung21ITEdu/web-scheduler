const LocationPreference = require('../models/locationPreferenceModel');

// Lấy location và preferences của user hiện tại trong group
exports.getUserLocationPreferences = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const groupId = req.params.groupId;

    const data = await LocationPreference.getUserLocationPreferences(userId, groupId);
    
    res.status(200).json({
      success: true,
      data: data || {
        location: '',
        preferences: {},
        otherPreference: ''
      },
      message: 'Lấy thông tin vị trí và sở thích thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy location preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin vị trí và sở thích'
    });
  }
};

// Lưu location và preferences của user hiện tại trong group
exports.saveUserLocationPreferences = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const groupId = req.params.groupId;
    const { location, preferences, otherPreference } = req.body;

    // Validate required fields
    if (!location && !preferences && !otherPreference) {
      return res.status(400).json({
        success: false,
        message: 'Cần ít nhất một thông tin để lưu'
      });
    }

    const result = await LocationPreference.saveUserLocationPreferences(userId, groupId, {
      location: location || '',
      preferences: preferences || {},
      otherPreference: otherPreference || ''
    });
    
    if (result) {
      res.status(200).json({
        success: true,
        message: 'Lưu vị trí và sở thích thành công'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể lưu thông tin'
      });
    }
  } catch (error) {
    console.error('Lỗi khi lưu location preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lưu vị trí và sở thích'
    });
  }
};

// Lấy location và preferences của tất cả thành viên trong group (chỉ leader)
exports.getGroupLocationPreferences = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const data = await LocationPreference.getGroupLocationPreferences(groupId);
    
    res.status(200).json({
      success: true,
      data: data,
      message: 'Lấy thông tin vị trí và sở thích của nhóm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy group location preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin nhóm'
    });
  }
};

// Xóa location preferences của user hiện tại trong group
exports.deleteUserLocationPreferences = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const groupId = req.params.groupId;

    const success = await LocationPreference.deleteUserLocationPreferences(userId, groupId);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Xóa vị trí và sở thích thành công'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin để xóa'
      });
    }
  } catch (error) {
    console.error('Lỗi khi xóa location preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa thông tin'
    });
  }
}; 