const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes - không cần authentication
router.get('/', postController.getAllPosts); // Lấy tất cả posts đã approve cho feed
router.get('/:id', postController.getPostById); // Lấy post theo ID

// Protected routes - cần authentication
router.post('/:id/like', authMiddleware.verifyToken, postController.toggleLike); // Like/unlike post

// Admin routes
router.get('/status/:status', authMiddleware.verifyToken, authMiddleware.isAdmin, postController.getPostsByStatus);
router.put('/:id/status', authMiddleware.verifyToken, authMiddleware.isAdmin, postController.updatePostStatus);

module.exports = router; 