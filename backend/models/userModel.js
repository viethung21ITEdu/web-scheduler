const db = require('../utils/db');

class User {
  // Lấy tất cả người dùng
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM USERS');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Lấy người dùng theo ID
  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM USERS WHERE user_id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy người dùng theo username
  static async getByUsername(username) {
    try {
      const [rows] = await db.query('SELECT * FROM USERS WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Lấy người dùng theo email
  static async getByEmail(email) {
    try {
      const [rows] = await db.query('SELECT * FROM USERS WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Tạo người dùng mới
  static async create(userData) {
    try {
      const { username, email, password, full_name, phone, role, status } = userData;
      const [result] = await db.query(
        'INSERT INTO USERS (username, email, password, full_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, email, password, full_name, phone, role, status || 'pending']
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật thông tin người dùng
  static async update(id, userData) {
    try {
      const { username, email, full_name, phone, role, status } = userData;
      const [result] = await db.query(
        'UPDATE USERS SET username = ?, email = ?, full_name = ?, phone = ?, role = ?, status = ? WHERE user_id = ?',
        [username, email, full_name, phone, role, status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Xóa người dùng
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM USERS WHERE user_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 