const db = require('../utils/db');

class Notification {
  // Tạo thông báo mới
  static async create(notificationData) {
    try {
      const { event_id, title, content, status = 'sent', recipients_count, success_count, fail_count } = notificationData;
      
      const query = `
        INSERT INTO notifications (event_id, title, content, status, recipients_count, success_count, fail_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      const values = [event_id, title, content, status, recipients_count, success_count, fail_count];
      const [result] = await db.execute(query, values);
      
      console.log('✅ Notification saved to database:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  // Lấy tất cả thông báo của một sự kiện
  static async getByEventId(eventId) {
    try {
      const query = `
        SELECT n.*, e.name as event_name, g.name as group_name
        FROM notifications n
        JOIN events e ON n.event_id = e.event_id
        JOIN \`groups\` g ON e.group_id = g.group_id
        WHERE n.event_id = ?
        ORDER BY n.created_at DESC
      `;
      
      const [rows] = await db.execute(query, [eventId]);
      return rows;
    } catch (error) {
      console.error('❌ Error getting notifications by event:', error);
      throw error;
    }
  }

  // Lấy tất cả thông báo của một nhóm
  static async getByGroupId(groupId) {
    try {
      const query = `
        SELECT n.*, e.name as event_name, g.name as group_name
        FROM notifications n
        JOIN events e ON n.event_id = e.event_id
        JOIN \`groups\` g ON e.group_id = g.group_id
        WHERE g.group_id = ?
        ORDER BY n.created_at DESC
      `;
      
      const [rows] = await db.execute(query, [groupId]);
      return rows;
    } catch (error) {
      console.error('❌ Error getting notifications by group:', error);
      throw error;
    }
  }

  // Lấy thông báo theo ID
  static async getById(notificationId) {
    try {
      const query = `
        SELECT n.*, e.name as event_name, g.name as group_name
        FROM notifications n
        JOIN events e ON n.event_id = e.event_id
        JOIN \`groups\` g ON e.group_id = g.group_id
        WHERE n.notification_id = ?
      `;
      
      const [rows] = await db.execute(query, [notificationId]);
      return rows[0] || null;
    } catch (error) {
      console.error('❌ Error getting notification by ID:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái thông báo
  static async updateStatus(notificationId, status) {
    try {
      const query = `
        UPDATE notifications 
        SET status = ?, updated_at = NOW()
        WHERE notification_id = ?
      `;
      
      const [result] = await db.execute(query, [status, notificationId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Error updating notification status:', error);
      throw error;
    }
  }

  // Xóa thông báo
  static async delete(notificationId) {
    try {
      const query = 'DELETE FROM notifications WHERE notification_id = ?';
      const [result] = await db.execute(query, [notificationId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  // Thống kê thông báo
  static async getStats(groupId = null) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_notifications,
          SUM(recipients_count) as total_recipients,
          SUM(success_count) as total_success,
          SUM(fail_count) as total_fails,
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count
        FROM notifications n
        JOIN events e ON n.event_id = e.event_id
      `;
      
      const values = [];
      if (groupId) {
        query += ' WHERE e.group_id = ?';
        values.push(groupId);
      }
      
      const [rows] = await db.execute(query, values);
      return rows[0];
    } catch (error) {
      console.error('❌ Error getting notification stats:', error);
      throw error;
    }
  }
}

module.exports = Notification; 