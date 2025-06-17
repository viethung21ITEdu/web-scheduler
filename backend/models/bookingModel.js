const db = require('../utils/db');

class Booking {
  // Lấy tất cả đặt chỗ
  static async getAll() {
    try {
      const query = `
        SELECT b.*, e.name as event_name, en.name as enterprise_name, u.full_name as booker_name
        FROM BOOKINGS b
        JOIN EVENTS e ON b.event_id = e.event_id
        JOIN ENTERPRISES en ON b.enterprise_id = en.enterprise_id
        JOIN USERS u ON b.booker_id = u.user_id
        ORDER BY b.booking_id DESC
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
      throw error;
    }
  }

  // Lấy đặt chỗ theo ID
  static async getById(id) {
    try {
      const query = `
        SELECT b.*, e.name as event_name, en.name as enterprise_name, u.full_name as booker_name
        FROM BOOKINGS b
        JOIN EVENTS e ON b.event_id = e.event_id
        JOIN ENTERPRISES en ON b.enterprise_id = en.enterprise_id
        JOIN USERS u ON b.booker_id = u.user_id
        WHERE b.booking_id = ?
      `;
      const [rows] = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đặt chỗ:', error);
      throw error;
    }
  }

  // Tạo đặt chỗ mới
  static async create(bookingData) {
    try {
      const { event_id, enterprise_id, booker_id, number_of_people, booking_time, notes, status } = bookingData;
      const query = `
        INSERT INTO BOOKINGS (event_id, enterprise_id, booker_id, number_of_people, booking_time, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [event_id, enterprise_id, booker_id, number_of_people, booking_time, notes, status];
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo đặt chỗ:', error);
      throw error;
    }
  }

  // Cập nhật thông tin đặt chỗ
  static async update(id, bookingData) {
    try {
      const { number_of_people, booking_time, notes, status } = bookingData;
      const query = `
        UPDATE BOOKINGS
        SET number_of_people = ?, booking_time = ?, notes = ?, status = ?
        WHERE booking_id = ?
      `;
      const values = [number_of_people, booking_time, notes, status, id];
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin đặt chỗ:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái đặt chỗ
  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE BOOKINGS
        SET status = ?
        WHERE booking_id = ?
      `;
      const values = [status, id];
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đặt chỗ:', error);
      throw error;
    }
  }

  // Xóa đặt chỗ
  static async delete(id) {
    try {
      const query = `
        DELETE FROM BOOKINGS
        WHERE booking_id = ?
      `;
      const [result] = await db.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa đặt chỗ:', error);
      throw error;
    }
  }

  // Lấy danh sách đặt chỗ theo người dùng
  static async getByUserId(userId) {
    try {
      const query = `
        SELECT b.*, e.name as event_name, en.name as enterprise_name
        FROM BOOKINGS b
        JOIN EVENTS e ON b.event_id = e.event_id
        JOIN ENTERPRISES en ON b.enterprise_id = en.enterprise_id
        WHERE b.booker_id = ?
        ORDER BY b.booking_id DESC
      `;
      const [rows] = await db.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ của người dùng:', error);
      throw error;
    }
  }

  // Lấy danh sách đặt chỗ theo doanh nghiệp
  static async getByEnterpriseId(enterpriseId) {
    try {
      const query = `
        SELECT b.*, e.name as event_name, u.full_name as booker_name
        FROM BOOKINGS b
        JOIN EVENTS e ON b.event_id = e.event_id
        JOIN USERS u ON b.booker_id = u.user_id
        WHERE b.enterprise_id = ?
        ORDER BY b.booking_id DESC
      `;
      const [rows] = await db.query(query, [enterpriseId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ của doanh nghiệp:', error);
      throw error;
    }
  }

  // Lấy danh sách đặt chỗ theo sự kiện
  static async getByEventId(eventId) {
    try {
      const query = `
        SELECT b.*, en.name as enterprise_name, u.full_name as booker_name
        FROM BOOKINGS b
        JOIN ENTERPRISES en ON b.enterprise_id = en.enterprise_id
        JOIN USERS u ON b.booker_id = u.user_id
        WHERE b.event_id = ?
        ORDER BY b.booking_id DESC
      `;
      const [rows] = await db.query(query, [eventId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ của sự kiện:', error);
      throw error;
    }
  }
}

module.exports = Booking; 