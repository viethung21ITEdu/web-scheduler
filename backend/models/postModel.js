const db = require('../utils/db');

class Post {
  static async getStats() {
    try {
      const [stats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM POSTS
      `);

      return stats[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };
    } catch (error) {
      console.error('❌ Error in Post.getStats:', error);
      throw error;
    }
  }

  static async updateStatus(postId, status) {
    try {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw new Error('Trạng thái không hợp lệ');
      }

      const [result] = await db.query(`
        UPDATE POSTS SET status = ? WHERE post_id = ?
      `, [status, postId]);

      if (result.affectedRows === 0) {
        throw new Error('Không tìm thấy bài đăng để cập nhật');
      }

      return { success: true, message: 'Cập nhật trạng thái thành công' };
    } catch (error) {
      console.error('❌ Error in Post.updateStatus:', error);
      throw error;
    }
  }
}

module.exports = Post; 