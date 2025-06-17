const db = require('../utils/db');

class Time {
  // Lấy tất cả timeslots của user trong một nhóm cụ thể
  static async getUserTimeslots(userId, groupId) {
    try {
      const [rows] = await db.query(`
        SELECT timeslot_id, user_id, group_id, start_time, end_time
        FROM timeslots 
        WHERE user_id = ? AND group_id = ?
        ORDER BY start_time ASC
      `, [userId, groupId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy timeslots của user:', error);
      throw error;
    }
  }

  // Lấy tất cả timeslots của user
  static async getAllUserTimeslots(userId) {
    try {
      const [rows] = await db.query(`
        SELECT timeslot_id, user_id, group_id, start_time, end_time
        FROM timeslots 
        WHERE user_id = ?
        ORDER BY start_time ASC
      `, [userId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy tất cả timeslots của user:', error);
      throw error;
    }
  }

  // Tạo timeslot mới
  static async createTimeslot(timeslotData) {
    try {
      const { user_id, group_id, start_time, end_time } = timeslotData;
      
      const [result] = await db.query(`
        INSERT INTO timeslots (user_id, group_id, start_time, end_time)
        VALUES (?, ?, ?, ?)
      `, [user_id, group_id, start_time, end_time]);
      
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo timeslot:', error);
      throw error;
    }
  }

  // Cập nhật timeslot
  static async updateTimeslot(timeslotId, timeslotData) {
    try {
      const { start_time, end_time } = timeslotData;
      
      const [result] = await db.query(`
        UPDATE timeslots 
        SET start_time = ?, end_time = ?
        WHERE timeslot_id = ?
      `, [start_time, end_time, timeslotId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật timeslot:', error);
      throw error;
    }
  }

  // Xóa timeslot
  static async deleteTimeslot(timeslotId, userId) {
    try {
      console.log('🗑️ Model deleteTimeslot called with:', { timeslotId, userId });
      
      const [result] = await db.query(`
        DELETE FROM timeslots 
        WHERE timeslot_id = ? AND user_id = ?
      `, [timeslotId, userId]);
      
      console.log('- SQL delete result:', result);
      console.log('- affectedRows:', result.affectedRows);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Lỗi khi xóa timeslot:', error);
      throw error;
    }
  }

  // Lấy timeslots của tất cả thành viên trong nhóm
  static async getGroupTimeslots(groupId) {
    try {
      const [rows] = await db.query(`
        SELECT 
          t.timeslot_id,
          t.user_id,
          t.group_id,
          u.username,
          u.full_name,
          t.start_time,
          t.end_time
        FROM timeslots t
        JOIN users u ON t.user_id = u.user_id
        WHERE t.group_id = ?
        ORDER BY t.start_time ASC, u.username ASC
      `, [groupId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy timeslots của nhóm:', error);
      throw error;
    }
  }

  // Tìm thời gian rảnh chung của tất cả thành viên trong nhóm
  static async getGroupAvailableTime(groupId, startDate, endDate) {
    try {
      // Lấy tất cả thành viên trong nhóm
      const [members] = await db.query(`
        SELECT DISTINCT u.user_id, u.username, u.full_name
        FROM users u
        JOIN memberships m ON u.user_id = m.user_id
        WHERE m.group_id = ?
      `, [groupId]);

      // Lấy tất cả timeslots bận của nhóm trong khoảng thời gian
      const [busySlots] = await db.query(`
        SELECT 
          t.user_id,
          t.start_time,
          t.end_time
        FROM timeslots t
        WHERE t.group_id = ? 
        AND t.start_time <= ? 
        AND t.end_time >= ?
        ORDER BY t.start_time ASC
      `, [groupId, endDate, startDate]);

      return {
        members,
        busySlots,
        totalMembers: members.length
      };
    } catch (error) {
      console.error('Lỗi khi tìm thời gian rảnh chung:', error);
      throw error;
    }
  }

  // Kiểm tra xem timeslot có belongs to user không
  static async isTimeslotOwner(timeslotId, userId) {
    try {
      console.log('🔍 Model isTimeslotOwner called with:', { timeslotId, userId });
      
      const [rows] = await db.query(`
        SELECT timeslot_id FROM timeslots 
        WHERE timeslot_id = ? AND user_id = ?
      `, [timeslotId, userId]);
      
      console.log('- SQL ownership check result:', rows);
      console.log('- rows.length:', rows.length);
      
      return rows.length > 0;
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra ownership timeslot:', error);
      throw error;
    }
  }
}

module.exports = Time; 