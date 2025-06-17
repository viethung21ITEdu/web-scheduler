const express = require('express');
const router = express.Router();
const enterpriseController = require('../controllers/enterpriseController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes cho bài đăng của doanh nghiệp (đặt trước routes có params)
router.get('/posts', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.getMyPosts);
router.post('/posts', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.createPost);
router.put('/posts/:postId', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.updatePost);
router.delete('/posts/:postId', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.deletePost);

// Routes cho profile doanh nghiệp
router.get('/profile', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.getMyProfile);
router.put('/profile', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.updateMyProfile);

// Routes cho đặt chỗ của doanh nghiệp hiện tại
router.get('/bookings', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.getMyBookings);
router.put('/bookings/:bookingId', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.updateMyBookingStatus);

// Routes công khai
router.get('/', enterpriseController.getAllEnterprises);
router.get('/:id', enterpriseController.getEnterpriseById);

// Routes yêu cầu xác thực
router.post('/', authMiddleware.verifyToken, enterpriseController.createEnterprise);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isEnterpriseOrAdmin, enterpriseController.updateEnterprise);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, enterpriseController.deleteEnterprise);

// Routes cho bài đăng của doanh nghiệp với params
router.get('/:id/posts', enterpriseController.getEnterprisePosts);
router.post('/:id/posts', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.createPost);
router.put('/:id/posts/:postId', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.updatePost);
router.delete('/:id/posts/:postId', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.deletePost);

// Routes cho đặt chỗ của doanh nghiệp
router.get('/:id/bookings', authMiddleware.verifyToken, authMiddleware.isEnterpriseOrAdmin, enterpriseController.getEnterpriseBookings);
router.put('/:id/bookings/:bookingId', authMiddleware.verifyToken, authMiddleware.isEnterprise, enterpriseController.updateBookingStatus);

module.exports = router; 