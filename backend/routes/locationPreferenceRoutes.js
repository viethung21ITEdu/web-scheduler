const express = require('express');
const router = express.Router();
const locationPreferenceController = require('../controllers/locationPreferenceController');
const authMiddleware = require('../middlewares/authMiddleware');

// Test route để kiểm tra locationPreferenceRoutes hoạt động
router.get('/test', (req, res) => {
  res.json({ message: 'Location preference routes loaded successfully!' });
});

// Tất cả routes đều yêu cầu xác thực
router.use(authMiddleware.verifyToken);

// Lấy location và preferences của user hiện tại trong group
router.get('/:groupId/location-preferences', locationPreferenceController.getUserLocationPreferences);

// Lưu location và preferences của user hiện tại trong group  
router.post('/:groupId/location-preferences', locationPreferenceController.saveUserLocationPreferences);

// Lấy location và preferences của tất cả thành viên trong group
router.get('/:groupId/all-location-preferences', locationPreferenceController.getGroupLocationPreferences);

// Xóa location preferences của user hiện tại trong group
router.delete('/:groupId/location-preferences', locationPreferenceController.deleteUserLocationPreferences);

module.exports = router; 