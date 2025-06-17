const jwt = require('jsonwebtoken');
const Group = require('../models/groupModel');
const config = require('../config');

// Middleware xác thực token
exports.verifyToken = (req, res, next) => {
  console.log('🎫 verifyToken middleware called');
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('❌ No authorization header');
    return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('🔑 Token found:', token?.substring(0, 10) + '...');
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    console.log('✅ Token verified, user:', decoded);
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Middleware kiểm tra quyền Admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }
};

// Middleware kiểm tra quyền Admin hoặc chính người dùng đó
exports.isAdminOrSelf = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.user_id === parseInt(req.params.id))) {
    next();
  } else {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }
};

// Middleware kiểm tra quyền Leader của nhóm
exports.isGroupLeader = async (req, res, next) => {
  try {
    // Lấy groupId từ params hoặc body
    const groupId = req.params.id || req.params.groupId || req.body.group_id;
    
    if (!groupId) {
      return res.status(400).json({ message: 'Không tìm thấy ID nhóm' });
    }

    const userId = req.user.user_id;
    
    // Lấy danh sách thành viên của nhóm
    const members = await Group.getMembers(groupId);
    
    // Kiểm tra xem người dùng có phải là Leader của nhóm không
    const isLeader = members.some(member => 
      member.user_id === userId && member.role_in_group === 'Leader'
    );
    
    if (isLeader || req.user.role === 'Admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra quyền Leader:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi kiểm tra quyền' });
  }
};

// Middleware kiểm tra quyền Leader của nhóm thông qua event
exports.isEventGroupLeader = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    
    if (!eventId) {
      return res.status(400).json({ message: 'Không tìm thấy ID sự kiện' });
    }

    // Lấy thông tin event để có groupId
    const Event = require('../models/eventModel');
    const event = await Event.getById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    const groupId = event.group_id;
    const userId = req.user.user_id;
    
    // Lấy danh sách thành viên của nhóm
    const members = await Group.getMembers(groupId);
    
    // Kiểm tra xem người dùng có phải là Leader của nhóm không
    const isLeader = members.some(member => 
      member.user_id === userId && member.role_in_group === 'Leader'
    );
    
    if (isLeader || req.user.role === 'Admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra quyền Leader qua event:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi kiểm tra quyền' });
  }
};

// Middleware kiểm tra xem người dùng có phải là thành viên của nhóm không
exports.isGroupMember = async (req, res, next) => {
  try {
    const groupId = req.params.id || req.params.groupId;
    const userId = req.user.user_id;
    
    // Admin luôn có quyền truy cập
    if (req.user.role === 'Admin') {
      return next();
    }
    
    // Lấy danh sách thành viên của nhóm
    const members = await Group.getMembers(groupId);
    
    // Kiểm tra xem người dùng có phải là thành viên của nhóm không
    const isMember = members.some(member => member.user_id === userId);
    
    if (isMember) {
      next();
    } else {
      return res.status(403).json({ message: 'Bạn không phải là thành viên của nhóm này' });
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra quyền thành viên:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi kiểm tra quyền' });
  }
};

// Middleware kiểm tra quyền Enterprise
exports.isEnterprise = (req, res, next) => {
  console.log('🔐 isEnterprise middleware, user:', req.user);
  
  if (req.user && req.user.role === 'Enterprise') {
    console.log('✅ Enterprise role verified');
    next();
  } else {
    console.log('❌ Not enterprise role:', req.user?.role);
    return res.status(403).json({ message: 'Chỉ doanh nghiệp mới có quyền truy cập' });
  }
};

// Middleware kiểm tra quyền Enterprise hoặc Admin
exports.isEnterpriseOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'Enterprise' || req.user.role === 'Admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }
}; 