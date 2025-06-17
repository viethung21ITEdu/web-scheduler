const db = require('../utils/db');

class Group {
  // Lấy tất cả nhóm
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM `GROUPS`');
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhóm:', error);
      throw error;
    }
  }

  // Lấy nhóm theo ID
  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM `GROUPS` WHERE group_id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy thông tin nhóm:', error);
      throw error;
    }
  }

  // Tạo nhóm mới
  static async create(groupData) {
    try {
      const { name, description } = groupData;
      
      // Thêm các trường status và created_at
      const [result] = await db.query(
        'INSERT INTO `GROUPS` (name, description, status, created_at) VALUES (?, ?, ?, NOW())',
        [name, description, 'active']
      );
      
      console.log('Kết quả tạo nhóm:', result);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi chi tiết khi tạo nhóm:', error);
      throw error;
    }
  }

  // Cập nhật thông tin nhóm
  static async update(id, groupData) {
    try {
      const { name, description, status } = groupData;
      const [result] = await db.query(
        'UPDATE `GROUPS` SET name = ?, description = ?, status = ?, updated_at = NOW() WHERE group_id = ?',
        [name, description, status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin nhóm:', error);
      throw error;
    }
  }

  // Xóa nhóm
  static async delete(id) {
    try {
      // Xóa tất cả các thành viên trong nhóm trước
      await db.query('DELETE FROM MEMBERSHIPS WHERE group_id = ?', [id]);
      
      // Sau đó xóa nhóm
      const [result] = await db.query('DELETE FROM `GROUPS` WHERE group_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa nhóm:', error);
      throw error;
    }
  }

  // Lấy danh sách nhóm mà user tham gia
  static async getUserGroups(userId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          g.group_id as id, 
          g.name, 
          g.description,
          g.status,
          g.created_at,
          m.role_in_group as role,
          (m.role_in_group = 'Leader') as isLeader,
          COUNT(m2.user_id) as memberCount
        FROM \`GROUPS\` g
        JOIN MEMBERSHIPS m ON g.group_id = m.group_id
        LEFT JOIN MEMBERSHIPS m2 ON g.group_id = m2.group_id
        WHERE m.user_id = ?
        GROUP BY g.group_id, g.name, g.description, g.status, g.created_at, m.role_in_group
        ORDER BY g.created_at DESC
      `, [userId]);
      
      // Format dates
      return rows.map(group => ({
        ...group,
        createdDate: new Date(group.created_at).toLocaleDateString('vi-VN'),
        status: group.status === 'active' ? 'Đang hoạt động' : 'Dừng hoạt động',
        isLeader: Boolean(group.isLeader)
      }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhóm của user:', error);
      throw error;
    }
  }

  // Lấy danh sách thành viên của nhóm
  static async getMembers(groupId) {
    try {
      const [rows] = await db.query(`
        SELECT u.user_id, u.username, u.full_name, u.email, m.role_in_group, m.joined_at
        FROM USERS u
        JOIN MEMBERSHIPS m ON u.user_id = m.user_id
        WHERE m.group_id = ?
      `, [groupId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thành viên nhóm:', error);
      throw error;
    }
  }

  // Thêm thành viên vào nhóm
  static async addMember(groupId, userId, role) {
    try {
      console.log('Thêm thành viên vào nhóm:', { groupId, userId, role });
      
      // Kiểm tra xem thành viên đã tồn tại trong nhóm chưa
      const [existingMembers] = await db.query(
        'SELECT * FROM MEMBERSHIPS WHERE group_id = ? AND user_id = ?',
        [groupId, userId]
      );
      
      if (existingMembers.length > 0) {
        console.log('Thành viên đã tồn tại trong nhóm');
        return existingMembers[0].id;
      }
      
      const [result] = await db.query(
        'INSERT INTO MEMBERSHIPS (user_id, group_id, role_in_group, joined_at) VALUES (?, ?, ?, NOW())',
        [userId, groupId, role]
      );
      
      console.log('Kết quả thêm thành viên:', result);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi chi tiết khi thêm thành viên vào nhóm:', error);
      throw error;
    }
  }

  // Xóa thành viên khỏi nhóm
  static async removeMember(groupId, userId) {
    try {
      // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
      await db.query('START TRANSACTION');
      
      try {
        // 1. Xóa timeslots của user trong nhóm này
        await db.execute(
          'DELETE FROM TIMESLOTS WHERE group_id = ? AND user_id = ?',
          [groupId, userId]
        );
        
        // 2. Xóa locations của user trong nhóm này
        await db.execute(
          'DELETE FROM LOCATIONS WHERE group_id = ? AND user_id = ?',
          [groupId, userId]
        );
        
        // 3. Xóa preferences của user trong nhóm này
        await db.execute(
          'DELETE FROM PREFERENCES WHERE group_id = ? AND user_id = ?',
          [groupId, userId]
        );
        
        // 4. Cuối cùng xóa membership
        const [result] = await db.execute(
          'DELETE FROM MEMBERSHIPS WHERE group_id = ? AND user_id = ?',
          [groupId, userId]
        );
        
        await db.query('COMMIT');
        return result.affectedRows > 0;
      } catch (innerError) {
        await db.query('ROLLBACK');
        throw innerError;
      }
    } catch (error) {
      console.error('Lỗi khi xóa thành viên khỏi nhóm:', error);
      throw error;
    }
  }

  // Tạo mã mời nhóm
  static async generateInviteCode(groupId, inviterId, type = 'link', email = null) {
    try {
      const inviteCode = `WEBmode-id-${groupId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
      
      const [result] = await db.execute(
        'INSERT INTO GROUP_INVITES (group_id, inviter_id, invite_code, invite_type, email, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [groupId, inviterId, inviteCode, type, email, expiresAt]
      );
      
      return {
        invite_id: result.insertId,
        invite_code: inviteCode,
        expires_at: expiresAt
      };
    } catch (error) {
      console.error('Lỗi khi tạo mã mời:', error);
      throw error;
    }
  }

  // Kiểm tra và sử dụng mã mời
  static async useInviteCode(inviteCode, userId) {
    try {
      await db.query('START TRANSACTION');
      
      try {
        // Kiểm tra mã mời
        const [invites] = await db.execute(
          'SELECT * FROM GROUP_INVITES WHERE invite_code = ? AND status = "pending" AND (expires_at IS NULL OR expires_at > NOW())',
          [inviteCode]
        );
        
        if (invites.length === 0) {
          throw new Error('Mã mời không hợp lệ hoặc đã hết hạn');
        }
        
        const invite = invites[0];
        
        // Kiểm tra user đã là thành viên chưa
        const [existingMembers] = await db.execute(
          'SELECT * FROM MEMBERSHIPS WHERE group_id = ? AND user_id = ?',
          [invite.group_id, userId]
        );
        
        if (existingMembers.length > 0) {
          throw new Error('Bạn đã là thành viên của nhóm này');
        }

        // Kiểm tra user đã có yêu cầu pending chưa
        const [existingRequests] = await db.execute(
          'SELECT * FROM GROUP_JOIN_REQUESTS WHERE group_id = ? AND user_id = ? AND status = "pending"',
          [invite.group_id, userId]
        );
        
        if (existingRequests.length > 0) {
          throw new Error('Bạn đã gửi yêu cầu tham gia nhóm này rồi. Vui lòng chờ leader duyệt.');
        }
        
        // Tạo yêu cầu tham gia nhóm
        const [requestResult] = await db.execute(
          'INSERT INTO GROUP_JOIN_REQUESTS (group_id, user_id, invite_id) VALUES (?, ?, ?)',
          [invite.group_id, userId, invite.invite_id]
        );
        
        // Không đánh dấu mã mời đã được sử dụng - cho phép nhiều người dùng cùng 1 link
        // Chỉ cập nhật lần sử dụng cuối cùng
        await db.execute(
          'UPDATE GROUP_INVITES SET used_at = NOW(), used_by = ? WHERE invite_id = ?',
          [userId, invite.invite_id]
        );
        
        await db.query('COMMIT');
        
        return {
          request_id: requestResult.insertId,
          group_id: invite.group_id
        };
      } catch (innerError) {
        await db.query('ROLLBACK');
        throw innerError;
      }
    } catch (error) {
      console.error('Lỗi khi sử dụng mã mời:', error);
      throw error;
    }
  }

  // Lấy danh sách yêu cầu tham gia nhóm
  static async getJoinRequests(groupId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          jr.request_id,
          jr.user_id,
          jr.message,
          jr.created_at,
          u.username,
          u.full_name,
          u.email,
          gi.invite_type,
          gi.email as invite_email
        FROM GROUP_JOIN_REQUESTS jr
        JOIN USERS u ON jr.user_id = u.user_id
        LEFT JOIN GROUP_INVITES gi ON jr.invite_id = gi.invite_id
        WHERE jr.group_id = ? AND jr.status = 'pending'
        ORDER BY jr.created_at DESC
      `, [groupId]);
      
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu cầu tham gia:', error);
      throw error;
    }
  }

  // Duyệt yêu cầu tham gia nhóm
  static async approveJoinRequest(requestId, processedBy) {
    try {
      await db.query('START TRANSACTION');
      
      try {
        // Lấy thông tin yêu cầu
        const [requests] = await db.execute(
          'SELECT * FROM GROUP_JOIN_REQUESTS WHERE request_id = ? AND status = "pending"',
          [requestId]
        );
        
        if (requests.length === 0) {
          throw new Error('Yêu cầu không tồn tại hoặc đã được xử lý');
        }
        
        const request = requests[0];
        
        // Thêm thành viên vào nhóm
        await db.execute(
          'INSERT INTO MEMBERSHIPS (user_id, group_id, role_in_group) VALUES (?, ?, "Member")',
          [request.user_id, request.group_id]
        );
        
        // Cập nhật trạng thái yêu cầu
        await db.execute(
          'UPDATE GROUP_JOIN_REQUESTS SET status = "approved", processed_at = NOW(), processed_by = ? WHERE request_id = ?',
          [processedBy, requestId]
        );
        
        await db.query('COMMIT');
        return true;
      } catch (innerError) {
        await db.query('ROLLBACK');
        throw innerError;
      }
    } catch (error) {
      console.error('Lỗi khi duyệt yêu cầu tham gia:', error);
      throw error;
    }
  }

  // Từ chối yêu cầu tham gia nhóm
  static async rejectJoinRequest(requestId, processedBy) {
    try {
      const [result] = await db.execute(
        'UPDATE GROUP_JOIN_REQUESTS SET status = "rejected", processed_at = NOW(), processed_by = ? WHERE request_id = ? AND status = "pending"',
        [processedBy, requestId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi từ chối yêu cầu tham gia:', error);
      throw error;
    }
  }

  // Kiểm tra user có phải leader không
  static async isLeader(groupId, userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM MEMBERSHIPS WHERE group_id = ? AND user_id = ? AND role_in_group = "Leader"',
        [groupId, userId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Lỗi khi kiểm tra leader:', error);
      throw error;
    }
  }

  // Đếm số thành viên trong nhóm (trừ leader)
  static async countNonLeaderMembers(groupId) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM MEMBERSHIPS WHERE group_id = ? AND role_in_group != "Leader"',
        [groupId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Lỗi khi đếm thành viên:', error);
      throw error;
    }
  }
}

module.exports = Group; 