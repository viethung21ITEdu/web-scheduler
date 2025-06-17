const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// POST /api/notifications/events/:eventId/send - Gửi thông báo sự kiện
router.post('/events/:eventId/send', notificationController.sendEventNotification);

// GET /api/notifications/events/:eventId - Lấy danh sách thông báo của sự kiện
router.get('/events/:eventId', notificationController.getEventNotifications);

// GET /api/notifications/groups/:groupId - Lấy danh sách thông báo của nhóm
router.get('/groups/:groupId', notificationController.getGroupNotifications);

// GET /api/notifications/stats - Lấy thống kê thông báo
router.get('/stats', notificationController.getNotificationStats);

// DELETE /api/notifications/:notificationId - Xóa thông báo
router.delete('/:notificationId', notificationController.deleteNotification);

// GET /api/notifications/test-email - Test email service
router.get('/test-email', notificationController.testEmailService);

module.exports = router; 