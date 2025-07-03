const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateUserInput } = require('../utils/validation');

// Route đăng ký và đăng nhập
router.post('/register', validateUserInput, userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Email verification routes
router.post('/send-email-verification', userController.sendEmailVerification);
router.post('/verify-email', userController.verifyEmailCode);
router.post('/resend-email-verification', userController.resendEmailVerification);

// Routes yêu cầu xác thực
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers);
router.get('/:id', authMiddleware.verifyToken, userController.getUserById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdminOrSelf, userController.updateUser);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.deleteUser);

// Route admin thêm hàng loạt người dùng
router.post('/batch', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.batchAddUsers);

// Routes cho profile cá nhân
router.get('/profile/me', authMiddleware.verifyToken, userController.getProfile);
router.put('/profile/me', authMiddleware.verifyToken, userController.updateProfile);

// Route thống kê user
router.get('/stats/me', authMiddleware.verifyToken, userController.getUserStats);

module.exports = router; 