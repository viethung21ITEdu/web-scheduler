const Group = require('../models/groupModel');
const User = require('../models/userModel');
const db = require('../utils/db');

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.getAll();
    res.status(200).json(groups);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhóm:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách nhóm' });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.getById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }
    
    // Get members and find leader
    const members = await Group.getMembers(groupId);
    const memberCount = members.length;
    
    // Find leader from members
    const leader = members.find(member => member.role_in_group === 'Leader');
    const leaderId = leader ? leader.user_id : null;
    
    res.status(200).json({
      success: true,
      data: {
        ...group,
        memberCount: memberCount,
        leader_id: leaderId
      },
      message: 'Lấy thông tin nhóm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhóm:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi lấy thông tin nhóm' 
    });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const groups = await Group.getUserGroups(userId);
    res.status(200).json({
      success: true,
      data: groups,
      message: 'Lấy danh sách nhóm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhóm của user:', error);
    res.status(500).json({ 
      success: false,
      data: [],
      message: 'Đã xảy ra lỗi khi lấy danh sách nhóm' 
    });
  }
};

exports.createGroup = async (req, res) => {
  try {
    console.log('Thông tin user từ token:', req.user);
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Tên nhóm là bắt buộc' });
    }

    const groupData = {
      name,
      description
    };

    console.log('Đang tạo nhóm với dữ liệu:', groupData);
    const groupId = await Group.create(groupData);
    console.log('Đã tạo nhóm với ID:', groupId);
    
    // Thêm người tạo nhóm vào nhóm với vai trò Leader
    if (req.user && req.user.user_id) {
      console.log('Thêm người tạo nhóm vào nhóm với vai trò Leader:', req.user.user_id);
      await Group.addMember(groupId, req.user.user_id, 'Leader');
      console.log('Đã thêm người tạo nhóm vào nhóm');
    } else {
      console.error('Không thể thêm người tạo nhóm vào nhóm: Không có thông tin user_id');
    }
    
    res.status(201).json({
      message: 'Tạo nhóm thành công',
      group_id: groupId
    });
  } catch (error) {
    console.error('Lỗi chi tiết khi tạo nhóm:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo nhóm', error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name, description, status } = req.body;

    // Kiểm tra xem nhóm có tồn tại không
    const existingGroup = await Group.getById(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    // Cập nhật thông tin nhóm
    const groupData = {
      name: name || existingGroup.name,
      description: description || existingGroup.description,
      status: status || existingGroup.status
    };

    const success = await Group.update(groupId, groupData);
    
    if (success) {
      res.status(200).json({ message: 'Cập nhật thông tin nhóm thành công' });
    } else {
      res.status(400).json({ message: 'Không thể cập nhật thông tin nhóm' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin nhóm:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thông tin nhóm' });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    // Kiểm tra xem nhóm có tồn tại không
    const existingGroup = await Group.getById(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }

    const success = await Group.delete(groupId);
    
    if (success) {
      res.status(200).json({ message: 'Xóa nhóm thành công' });
    } else {
      res.status(400).json({ message: 'Không thể xóa nhóm' });
    }
  } catch (error) {
    console.error('Lỗi khi xóa nhóm:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa nhóm' });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    // Kiểm tra xem nhóm có tồn tại không
    const existingGroup = await Group.getById(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }
    
    const members = await Group.getMembers(groupId);
    res.status(200).json(members);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thành viên nhóm:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách thành viên nhóm' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { user_id, role } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'ID người dùng là bắt buộc' });
    }
    
    // Kiểm tra xem nhóm có tồn tại không
    const existingGroup = await Group.getById(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }
    
    // Thêm thành viên vào nhóm
    const membershipId = await Group.addMember(groupId, user_id, role || 'Member');
    
    res.status(201).json({
      message: 'Thêm thành viên vào nhóm thành công',
      membership_id: membershipId
    });
  } catch (error) {
    console.error('Lỗi khi thêm thành viên vào nhóm:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm thành viên vào nhóm' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    
    // Kiểm tra xem nhóm có tồn tại không
    const existingGroup = await Group.getById(groupId);
    if (!existingGroup) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm' });
    }
    
    // Xóa thành viên khỏi nhóm
    const success = await Group.removeMember(groupId, userId);
    
    if (success) {
      res.status(200).json({ message: 'Xóa thành viên khỏi nhóm thành công' });
    } else {
      res.status(400).json({ message: 'Không thể xóa thành viên khỏi nhóm' });
    }
  } catch (error) {
    console.error('Lỗi khi xóa thành viên khỏi nhóm:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa thành viên khỏi nhóm' });
  }
};

// Tạo link mời nhóm
exports.generateInviteLink = async (req, res) => {
  try {
    const groupId = req.params.id;
    const inviterId = req.user.user_id;
    
    const invite = await Group.generateInviteCode(groupId, inviterId, 'link');
    
    res.status(200).json({
      success: true,
      data: {
        invite_code: invite.invite_code,
        expires_at: invite.expires_at
      },
      message: 'Tạo link mời thành công'
    });
  } catch (error) {
    console.error('Lỗi khi tạo link mời:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi tạo link mời' 
    });
  }
};

// Gửi lời mời qua email
exports.sendEmailInvite = async (req, res) => {
  try {
    const groupId = req.params.id;
    const inviterId = req.user.user_id;
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }
    
    // Lấy thông tin nhóm và người mời
    const group = await Group.getById(groupId);
    const inviter = await User.getById(inviterId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }
    
    const invite = await Group.generateInviteCode(groupId, inviterId, 'email', email);
    
    // Gửi email thực tế
    const emailService = require('../services/emailService');
    const emailResult = await emailService.sendGroupInvite(
      email,
      group.name,
      invite.invite_code,
      inviter.full_name || inviter.username
    );
    
    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: `Đã gửi lời mời đến ${email}`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau.'
      });
    }
  } catch (error) {
    console.error('Lỗi khi gửi lời mời email:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi gửi lời mời' 
    });
  }
};

// Tham gia nhóm bằng mã mời
exports.joinGroupByInvite = async (req, res) => {
  try {
    const inviteCode = req.params.inviteCode;
    const userId = req.user.user_id;
    
    const result = await Group.useInviteCode(inviteCode, userId);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Yêu cầu tham gia nhóm đã được gửi. Vui lòng chờ leader duyệt.'
    });
  } catch (error) {
    console.error('Lỗi khi tham gia nhóm:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi tham gia nhóm' 
    });
  }
};

// Lấy danh sách yêu cầu tham gia nhóm
exports.getJoinRequests = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    const requests = await Group.getJoinRequests(groupId);
    
    res.status(200).json({
      success: true,
      data: requests,
      message: 'Lấy danh sách yêu cầu thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu cầu:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách yêu cầu' 
    });
  }
};

// Duyệt yêu cầu tham gia nhóm
exports.approveJoinRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const processedBy = req.user.user_id;
    
    const success = await Group.approveJoinRequest(requestId, processedBy);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Đã duyệt yêu cầu tham gia nhóm'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể duyệt yêu cầu'
      });
    }
  } catch (error) {
    console.error('Lỗi khi duyệt yêu cầu:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi duyệt yêu cầu' 
    });
  }
};

// Từ chối yêu cầu tham gia nhóm
exports.rejectJoinRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const processedBy = req.user.user_id;
    
    const success = await Group.rejectJoinRequest(requestId, processedBy);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Đã từ chối yêu cầu tham gia nhóm'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể từ chối yêu cầu'
      });
    }
  } catch (error) {
    console.error('Lỗi khi từ chối yêu cầu:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi từ chối yêu cầu' 
    });
  }
};

// Rời nhóm
exports.leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.user_id;
    
    // Kiểm tra xem user có phải leader không
    const isLeader = await Group.isLeader(groupId, userId);
    
    if (isLeader) {
      // Kiểm tra xem còn thành viên khác không
      const nonLeaderCount = await Group.countNonLeaderMembers(groupId);
      
      if (nonLeaderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Bạn là nhóm trưởng, không thể rời nhóm khi còn thành viên khác.',
          code: 'LEADER_HAS_MEMBERS'
        });
      }
      
      // Kiểm tra xem có sự kiện đang diễn ra không
      const [activeEvents] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM events 
        WHERE group_id = ? 
        AND status = 'active' 
        AND NOW() BETWEEN start_time AND end_time
      `, [groupId]);
      
      if (activeEvents[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Sự kiện đang diễn ra, không thể rời nhóm.',
          code: 'EVENT_IN_PROGRESS'
        });
      }
    }
    
    // Xóa thành viên khỏi nhóm (sử dụng logic removeMember đã có)
    const success = await Group.removeMember(groupId, userId);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Đã rời nhóm thành công'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể rời nhóm'
      });
    }
  } catch (error) {
    console.error('Lỗi khi rời nhóm:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi rời nhóm' 
    });
  }
}; 