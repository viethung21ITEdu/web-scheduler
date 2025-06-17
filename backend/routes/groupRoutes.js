const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes công khai
router.get('/', groupController.getAllGroups);

// Routes yêu cầu xác thực  
router.get('/user/groups', authMiddleware.verifyToken, groupController.getUserGroups);

// Routes công khai (phải đặt sau routes có path cụ thể)
router.get('/:id', groupController.getGroupById);

// Routes yêu cầu xác thực
router.post('/', authMiddleware.verifyToken, groupController.createGroup);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isGroupLeader, groupController.updateGroup);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isGroupLeader, groupController.deleteGroup);

// Routes cho thành viên
router.get('/:id/members', groupController.getGroupMembers);
// Cho phép tất cả thành viên nhóm thêm thành viên mới
router.post('/:id/members', authMiddleware.verifyToken, authMiddleware.isGroupMember, groupController.addMember);
router.delete('/:groupId/members/:userId', authMiddleware.verifyToken, authMiddleware.isGroupLeader, groupController.removeMember);

// Routes cho lời mời nhóm
router.post('/:id/invite-link', authMiddleware.verifyToken, authMiddleware.isGroupMember, groupController.generateInviteLink);
router.post('/:id/invite-email', authMiddleware.verifyToken, authMiddleware.isGroupMember, groupController.sendEmailInvite);
router.post('/join/:inviteCode', authMiddleware.verifyToken, groupController.joinGroupByInvite);

// Routes cho yêu cầu tham gia nhóm
router.get('/:id/requests', authMiddleware.verifyToken, authMiddleware.isGroupLeader, groupController.getJoinRequests);
router.post('/:id/requests/:requestId/approve', authMiddleware.verifyToken, authMiddleware.isGroupLeader, groupController.approveJoinRequest);
router.post('/:id/requests/:requestId/reject', authMiddleware.verifyToken, authMiddleware.isGroupLeader, groupController.rejectJoinRequest);

// Route cho thành viên rời nhóm
router.post('/:id/leave', authMiddleware.verifyToken, authMiddleware.isGroupMember, groupController.leaveGroup);

module.exports = router; 