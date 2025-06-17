const User = require('../models/userModel');
const Group = require('../models/groupModel');
const Enterprise = require('../models/enterpriseModel');
const Post = require('../models/postModel');
const db = require('../utils/db');

// Lấy thống kê tổng quan cho dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard stats...');

    // Thống kê người dùng
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as newToday,
        SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) as newThisWeek
      FROM USERS
    `);

    // Thống kê bài đăng
    const [postStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM POSTS
    `);

    // Thống kê nhóm
    const [groupStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) as newThisWeek
      FROM \`groups\`
    `);

    // Thống kê doanh nghiệp
    const [enterpriseStats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as pending
      FROM ENTERPRISES
    `);

    // Báo cáo gần đây (giả lập - có thể tạo bảng reports riêng)
    const [recentReports] = await db.query(`
      SELECT 
        'post' as type,
        'Bài đăng chờ duyệt' as title,
        'pending' as status,
        created_at as date,
        post_id as id
      FROM POSTS 
      WHERE status = 'pending'
      UNION ALL
      SELECT 
        'enterprise' as type,
        'Doanh nghiệp chờ duyệt' as title,
        'pending' as status,
        created_at as date,
        enterprise_id as id
      FROM ENTERPRISES 
      WHERE status = 'inactive'
      ORDER BY date DESC
      LIMIT 4
    `);

    const dashboardData = {
      userStats: userStats[0] || { total: 0, active: 0, newToday: 0, newThisWeek: 0 },
      postStats: postStats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 },
      groupStats: groupStats[0] || { total: 0, active: 0, newThisWeek: 0 },
      enterpriseStats: enterpriseStats[0] || { total: 0, active: 0, pending: 0 },
      recentReports: recentReports || []
    };

    console.log('✅ Dashboard stats fetched successfully:', dashboardData);
    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard'
    });
  }
};

// Lấy danh sách người dùng với phân trang
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, role } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const [users] = await db.query(`
      SELECT user_id, username, email, full_name, role, status, created_at
      FROM USERS 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [totalCount] = await db.query(`
      SELECT COUNT(*) as total FROM USERS ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].total,
          totalPages: Math.ceil(totalCount[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng'
    });
  }
};

// Lấy danh sách bài đăng với phân trang
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, enterprise_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    if (enterprise_id) {
      whereClause += ' AND p.enterprise_id = ?';
      params.push(enterprise_id);
    }

    const [posts] = await db.query(`
      SELECT 
        p.post_id as id, p.title, p.content, p.status, p.created_at,
        e.name as enterprise_name, e.enterprise_type as type,
        e.address as enterprise_address,
        u.username, u.full_name
      FROM POSTS p
      LEFT JOIN ENTERPRISES e ON p.enterprise_id = e.enterprise_id
      LEFT JOIN USERS u ON e.user_id = u.user_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [totalCount] = await db.query(`
      SELECT COUNT(*) as total FROM POSTS p ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].total,
          totalPages: Math.ceil(totalCount[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài đăng'
    });
  }
};

// Lấy danh sách nhóm với phân trang
exports.getGroups = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND g.status = ?';
      params.push(status);
    }

    const [groups] = await db.query(`
      SELECT 
        g.group_id, g.name, g.description, g.status, g.created_at,
        leader.username as leader_username, leader.full_name as leader_name,
        COUNT(DISTINCT m.user_id) as member_count
      FROM \`groups\` g
      LEFT JOIN MEMBERSHIPS leader_membership ON g.group_id = leader_membership.group_id AND leader_membership.role_in_group = 'Leader'
      LEFT JOIN USERS leader ON leader_membership.user_id = leader.user_id
      LEFT JOIN MEMBERSHIPS m ON g.group_id = m.group_id
      ${whereClause}
      GROUP BY g.group_id, leader.user_id
      ORDER BY g.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [totalCount] = await db.query(`
      SELECT COUNT(*) as total FROM \`groups\` g ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        groups,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].total,
          totalPages: Math.ceil(totalCount[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhóm'
    });
  }
};

// Cập nhật trạng thái nhóm (khóa/mở khóa)
exports.updateGroupStatus = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const [result] = await db.query(
      'UPDATE `groups` SET status = ? WHERE group_id = ?',
      [status, groupId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    res.json({
      success: true,
      message: `${status === 'inactive' ? 'Khóa' : 'Mở khóa'} nhóm thành công`
    });

  } catch (error) {
    console.error('❌ Error updating group status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái nhóm'
    });
  }
};

// Xóa nhóm
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Kiểm tra nhóm có tồn tại không
    const [existingGroup] = await db.query(
      'SELECT group_id FROM `groups` WHERE group_id = ?',
      [groupId]
    );

    if (existingGroup.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhóm'
      });
    }

    // Xóa tất cả thành viên trong nhóm trước
    await db.query('DELETE FROM MEMBERSHIPS WHERE group_id = ?', [groupId]);
    
    // Xóa tất cả events của nhóm
    await db.query('DELETE FROM EVENTS WHERE group_id = ?', [groupId]);
    
    // Sau đó xóa nhóm
    const [result] = await db.query('DELETE FROM `groups` WHERE group_id = ?', [groupId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không thể xóa nhóm'
      });
    }

    res.json({
      success: true,
      message: 'Xóa nhóm thành công'
    });

  } catch (error) {
    console.error('❌ Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa nhóm'
    });
  }
};

// Cập nhật trạng thái nhiều nhóm cùng lúc
exports.batchUpdateGroupStatus = async (req, res) => {
  try {
    const { groupIds, status } = req.body;

    if (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách nhóm không hợp lệ'
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const placeholders = groupIds.map(() => '?').join(',');
    const [result] = await db.query(
      `UPDATE \`groups\` SET status = ? WHERE group_id IN (${placeholders})`,
      [status, ...groupIds]
    );

    res.json({
      success: true,
      message: `${status === 'inactive' ? 'Khóa' : 'Mở khóa'} ${result.affectedRows} nhóm thành công`
    });

  } catch (error) {
    console.error('❌ Error batch updating group status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái nhóm'
    });
  }
};

// Xóa nhiều nhóm cùng lúc
exports.batchDeleteGroups = async (req, res) => {
  try {
    const { groupIds } = req.body;

    if (!groupIds || !Array.isArray(groupIds) || groupIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách nhóm không hợp lệ'
      });
    }

    const placeholders = groupIds.map(() => '?').join(',');
    
    // Xóa tất cả thành viên trong các nhóm
    await db.query(
      `DELETE FROM MEMBERSHIPS WHERE group_id IN (${placeholders})`,
      groupIds
    );
    
    // Xóa tất cả events của các nhóm
    await db.query(
      `DELETE FROM EVENTS WHERE group_id IN (${placeholders})`,
      groupIds
    );
    
    // Xóa các nhóm
    const [result] = await db.query(
      `DELETE FROM \`groups\` WHERE group_id IN (${placeholders})`,
      groupIds
    );

    res.json({
      success: true,
      message: `Xóa ${result.affectedRows} nhóm thành công`
    });

  } catch (error) {
    console.error('❌ Error batch deleting groups:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa nhóm'
    });
  }
};

// Lấy danh sách doanh nghiệp với phân trang
exports.getEnterprises = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND e.status = ?';
      params.push(status);
    }

    const [enterprises] = await db.query(`
      SELECT 
        e.enterprise_id, e.name, e.enterprise_type, e.contact_person, 
        e.phone, e.address, e.website, e.description, e.opening_hours, 
        e.capacity, e.facilities, e.status, e.created_at,
        u.email, u.username, u.full_name
      FROM ENTERPRISES e
      LEFT JOIN USERS u ON e.user_id = u.user_id
      ${whereClause}
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [totalCount] = await db.query(`
      SELECT COUNT(*) as total FROM ENTERPRISES e ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        enterprises,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount[0].total,
          totalPages: Math.ceil(totalCount[0].total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching enterprises:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách doanh nghiệp'
    });
  }
};

// Cập nhật trạng thái người dùng
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const [result] = await db.query(
      'UPDATE USERS SET status = ? WHERE user_id = ?',
      [status, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái người dùng thành công'
    });

  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái người dùng'
    });
  }
};

// Cập nhật trạng thái bài đăng
exports.updatePostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const [result] = await db.query(
      'UPDATE POSTS SET status = ? WHERE post_id = ?',
      [status, postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái bài đăng thành công'
    });

  } catch (error) {
    console.error('❌ Error updating post status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái bài đăng'
    });
  }
};

// Thêm người dùng hàng loạt
exports.batchAddUsers = async (req, res) => {
  try {
    const { emails, defaultPassword, role = 'Member' } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách email không hợp lệ'
      });
    }

    if (!defaultPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mặc định là bắt buộc'
      });
    }

    // Validate role
    if (!['Admin', 'Member', 'Enterprise'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Quyền không hợp lệ. Chỉ chấp nhận: Admin, Member, Enterprise'
      });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const results = [];
    const errors = [];

    for (const email of emails) {
      try {
        // Kiểm tra email đã tồn tại chưa
        const [existingUser] = await db.query(
          'SELECT user_id FROM USERS WHERE email = ?',
          [email]
        );

        if (existingUser.length > 0) {
          errors.push(`Email ${email} đã tồn tại`);
          continue;
        }

        // Tạo username từ email
        const username = email.split('@')[0];
        
        // Kiểm tra username đã tồn tại chưa
        const [existingUsername] = await db.query(
          'SELECT user_id FROM USERS WHERE username = ?',
          [username]
        );

        let finalUsername = username;
        let counter = 1;
        while (existingUsername.length > 0) {
          finalUsername = `${username}${counter}`;
          const [checkUsername] = await db.query(
            'SELECT user_id FROM USERS WHERE username = ?',
            [finalUsername]
          );
          if (checkUsername.length === 0) break;
          counter++;
        }

        // Tạo user mới
        const [result] = await db.query(
          'INSERT INTO USERS (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
          [finalUsername, email, hashedPassword, email.split('@')[0], role, 'active']
        );

        results.push({
          user_id: result.insertId,
          username: finalUsername,
          email: email,
          full_name: email.split('@')[0],
          role: role
        });

      } catch (error) {
        console.error(`❌ Error creating user ${email}:`, error);
        errors.push(`Lỗi tạo user ${email}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Đã tạo thành công ${results.length} người dùng`,
      data: {
        created: results,
        errors: errors,
        total: emails.length,
        success_count: results.length,
        error_count: errors.length
      }
    });

  } catch (error) {
    console.error('❌ Error in batch add users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm người dùng hàng loạt'
    });
  }
};

// Tìm kiếm người dùng
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
      });
    }

    const searchTerm = `%${query.trim()}%`;
    
    const [users] = await db.query(`
      SELECT user_id, username, email, full_name, role, status, created_at
      FROM USERS 
      WHERE (username LIKE ? OR email LIKE ? OR full_name LIKE ?)
        AND role != 'Admin'
      ORDER BY created_at DESC
      LIMIT 50
    `, [searchTerm, searchTerm, searchTerm]);

    res.json({
      success: true,
      data: users,
      total: users.length
    });

  } catch (error) {
    console.error('❌ Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm người dùng'
    });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra user có tồn tại không
    const [user] = await db.query(
      'SELECT user_id, role FROM USERS WHERE user_id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép xóa Admin
    if (user[0].role === 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản Admin'
      });
    }

    // Xóa user (CASCADE sẽ tự động xóa các bản ghi liên quan)
    const [result] = await db.query(
      'DELETE FROM USERS WHERE user_id = ?',
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không thể xóa người dùng'
      });
    }

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa người dùng'
    });
  }
};

// Xóa nhiều người dùng
exports.batchDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ID người dùng không hợp lệ'
      });
    }

    // Kiểm tra không có Admin trong danh sách
    const [adminUsers] = await db.query(
      `SELECT user_id FROM USERS WHERE user_id IN (${userIds.map(() => '?').join(',')}) AND role = 'Admin'`,
      userIds
    );

    if (adminUsers.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Không thể xóa tài khoản Admin'
      });
    }

    // Xóa users
    const [result] = await db.query(
      `DELETE FROM USERS WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
      userIds
    );

    res.json({
      success: true,
      message: `Đã xóa thành công ${result.affectedRows} người dùng`,
      data: {
        deleted_count: result.affectedRows,
        requested_count: userIds.length
      }
    });

  } catch (error) {
    console.error('❌ Error batch deleting users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa người dùng hàng loạt'
    });
  }
};

// Tìm kiếm doanh nghiệp
exports.searchEnterprises = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Từ khóa tìm kiếm không được để trống'
      });
    }

    const searchTerm = `%${query.trim()}%`;
    
    const [enterprises] = await db.query(`
      SELECT 
        e.enterprise_id as id,
        e.name,
        e.enterprise_type as type,
        e.address,
        e.contact_person,
        e.phone,
        e.website,
        e.description,
        e.opening_hours,
        e.capacity,
        e.facilities,
        e.status,
        COUNT(p.post_id) as post_count
      FROM ENTERPRISES e
      LEFT JOIN POSTS p ON e.enterprise_id = p.enterprise_id
      WHERE e.name LIKE ? OR e.contact_person LIKE ?
      GROUP BY e.enterprise_id
      ORDER BY e.name ASC
      LIMIT 20
    `, [searchTerm, searchTerm]);

    res.json({
      success: true,
      data: enterprises,
      total: enterprises.length
    });

  } catch (error) {
    console.error('❌ Error searching enterprises:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm doanh nghiệp'
    });
  }
};

// Duyệt doanh nghiệp (chuyển từ inactive/pending thành active)
exports.approveEnterprise = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await Enterprise.updateStatus(id, 'active');
    
    if (success) {
      res.json({
        success: true,
        message: 'Duyệt doanh nghiệp thành công'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể duyệt doanh nghiệp'
      });
    }
  } catch (error) {
    console.error('❌ Error approving enterprise:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi duyệt doanh nghiệp'
    });
  }
};

// Từ chối/khóa doanh nghiệp (chuyển thành inactive)
exports.rejectEnterprise = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await Enterprise.updateStatus(id, 'inactive');
    
    if (success) {
      res.json({
        success: true,
        message: 'Từ chối/khóa doanh nghiệp thành công'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể từ chối/khóa doanh nghiệp'
      });
    }
  } catch (error) {
    console.error('❌ Error rejecting enterprise:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi từ chối/khóa doanh nghiệp'
    });
  }
};

// Cập nhật trạng thái doanh nghiệp (tổng quát)
exports.updateEnterpriseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: active, inactive'
      });
    }

    const success = await Enterprise.updateStatus(id, status);
    
    if (success) {
      res.json({
        success: true,
        message: 'Cập nhật trạng thái doanh nghiệp thành công'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Không thể cập nhật trạng thái doanh nghiệp'
      });
    }
  } catch (error) {
    console.error('❌ Error updating enterprise status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái doanh nghiệp'
    });
  }
};