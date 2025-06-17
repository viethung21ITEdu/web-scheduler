const express = require('express');
const router = express.Router();
const timeController = require('../controllers/timeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Test route để kiểm tra timeRoutes hoạt động
router.get('/test', (req, res) => {
  res.status(200).send({
    message: 'Time routes đang hoạt động!'
  });
});

// Tất cả routes khác đều yêu cầu xác thực
router.use(authMiddleware.verifyToken);

// Lấy tất cả timeslots của user hiện tại trong một nhóm cụ thể
router.get('/', timeController.getUserTimeslots);

// Lấy tất cả timeslots của user hiện tại (không phân biệt nhóm)
router.get('/all', timeController.getAllUserTimeslots);

// Tạo timeslot mới
router.post('/', timeController.createTimeslot);

// Cập nhật timeslot
router.put('/:id', timeController.updateTimeslot);

// Xóa timeslot
router.delete('/:id', timeController.deleteTimeslot);

// Lấy timeslots chung của tất cả thành viên trong nhóm
router.get('/group/:groupId', timeController.getGroupTimeslots);

// Lấy thời gian rảnh chung (intersection) của nhóm
router.get('/group/:groupId/available', timeController.getGroupAvailableTime);

module.exports = router; 