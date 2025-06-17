const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware để kiểm tra quyền admin cho tất cả routes
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.isAdmin);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management routes
router.get('/users', adminController.getUsers);
router.get('/users/search', adminController.searchUsers);
router.post('/users/batch-add', adminController.batchAddUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users/batch-delete', adminController.batchDeleteUsers);

// Post management routes
router.get('/posts', adminController.getPosts);
router.put('/posts/:postId/status', adminController.updatePostStatus);

// Group management routes
router.get('/groups', adminController.getGroups);
router.put('/groups/batch-status', adminController.batchUpdateGroupStatus);
router.delete('/groups/batch', adminController.batchDeleteGroups);
router.put('/groups/:groupId/status', adminController.updateGroupStatus);
router.delete('/groups/:groupId', adminController.deleteGroup);

// Enterprise management routes
router.get('/enterprises', adminController.getEnterprises);
router.get('/enterprises/search', adminController.searchEnterprises);
router.put('/enterprises/:id/approve', adminController.approveEnterprise);
router.put('/enterprises/:id/reject', adminController.rejectEnterprise);
router.put('/enterprises/:id/status', adminController.updateEnterpriseStatus);

module.exports = router; 