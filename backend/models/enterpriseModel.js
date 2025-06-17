const db = require('../utils/db');

class Enterprise {
  // Lấy tất cả doanh nghiệp
  static async getAll() {
    try {
      const query = `
        SELECT e.*, u.email
        FROM enterprises e
        JOIN users u ON e.user_id = u.user_id
        ORDER BY e.name
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách doanh nghiệp:', error);
      throw error;
    }
  }

  // Lấy doanh nghiệp theo ID
  static async getById(id) {
    try {
      const query = `
        SELECT e.*, u.email
        FROM enterprises e
        JOIN users u ON e.user_id = u.user_id
        WHERE e.enterprise_id = ?
      `;
      const [rows] = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy thông tin doanh nghiệp:', error);
      throw error;
    }
  }

  // Lấy doanh nghiệp theo user_id
  static async getByUserId(userId) {
    try {
      const query = `
        SELECT *
        FROM enterprises
        WHERE user_id = ?
      `;
      const [rows] = await db.query(query, [userId]);
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy thông tin doanh nghiệp theo user_id:', error);
      throw error;
    }
  }

  // Lấy profile đầy đủ của doanh nghiệp (bao gồm thông tin user)
  static async getProfileByUserId(userId) {
    try {
      const query = `
        SELECT 
          e.*,
          u.email,
          u.username
        FROM enterprises e
        JOIN users u ON e.user_id = u.user_id
        WHERE e.user_id = ?
        LIMIT 1
      `;
      const [rows] = await db.query(query, [userId]);
      
      if (rows[0] && rows[0].facilities) {
        try {
          // Nếu đã là array thì giữ nguyên
          if (Array.isArray(rows[0].facilities)) {
            // Đã là array, không cần parse
          } else if (typeof rows[0].facilities === 'string') {
            // Nếu là string, thử parse JSON
            if (rows[0].facilities.startsWith('[') && rows[0].facilities.endsWith(']')) {
              rows[0].facilities = JSON.parse(rows[0].facilities);
            } else {
              // Nếu là string comma-separated, chuyển thành array
              rows[0].facilities = rows[0].facilities.split(',').map(item => item.trim()).filter(item => item);
            }
          }
        } catch (parseError) {
          console.error('Lỗi parse JSON facilities:', parseError);
          rows[0].facilities = [];
        }
      } else if (rows[0]) {
        rows[0].facilities = [];
      }
      
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy profile doanh nghiệp:', error);
      throw error;
    }
  }

  // Tạo doanh nghiệp mới
  static async create(enterpriseData) {
    try {
      const { user_id, name, enterprise_type, contact_person, phone, address } = enterpriseData;
      const query = `
        INSERT INTO enterprises (user_id, name, enterprise_type, contact_person, phone, address, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'inactive', NOW())
      `;
      const values = [user_id, name, enterprise_type, contact_person, phone, address];
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo doanh nghiệp:', error);
      throw error;
    }
  }

  // Cập nhật thông tin doanh nghiệp
  static async update(id, enterpriseData) {
    try {
      const { 
        name, 
        enterprise_type, 
        contact_person, 
        phone, 
        description, 
        address, 
        website, 
        opening_hours, 
        capacity, 
        facilities 
      } = enterpriseData;
      
      const query = `
        UPDATE enterprises
        SET name = ?, enterprise_type = ?, contact_person = ?, phone = ?, 
            description = ?, address = ?, website = ?, opening_hours = ?, 
            capacity = ?, facilities = ?, updated_at = NOW()
        WHERE enterprise_id = ?
      `;
      
      const values = [
        name, 
        enterprise_type, 
        contact_person, 
        phone, 
        description, 
        address, 
        website, 
        opening_hours, 
        capacity, 
        facilities ? JSON.stringify(facilities) : null, 
        id
      ];
      
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin doanh nghiệp:', error);
      throw error;
    }
  }

  // Xóa doanh nghiệp
  static async delete(id) {
    try {
      // Xóa tất cả các bài đăng liên quan đến doanh nghiệp này trước
      await db.query('DELETE FROM posts WHERE enterprise_id = ?', [id]);
      
      // Xóa tất cả các đặt chỗ liên quan đến doanh nghiệp này
      await db.query('DELETE FROM bookings WHERE enterprise_id = ?', [id]);
      
      // Sau đó xóa doanh nghiệp
      const query = `
        DELETE FROM enterprises
        WHERE enterprise_id = ?
      `;
      const [result] = await db.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa doanh nghiệp:', error);
      throw error;
    }
  }

  // Lấy danh sách bài đăng của doanh nghiệp
  static async getPosts(enterpriseId) {
    try {
      console.log('🔍 Querying posts for enterprise ID:', enterpriseId);
      
      const query = `
        SELECT 
          p.post_id as id,
          p.enterprise_id,
          p.title,
          p.content,
          p.status,
          p.created_at,
          e.name as enterprise_name,
          e.enterprise_type as type,
          e.address as enterprise_address
        FROM posts p
        JOIN enterprises e ON p.enterprise_id = e.enterprise_id
        WHERE p.enterprise_id = ?
        ORDER BY p.created_at DESC
      `;
      const [rows] = await db.query(query, [enterpriseId]);
      
      console.log('📊 Raw DB query result:', rows.length, 'posts found');
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài đăng:', error);
      throw error;
    }
  }

  // Lấy bài đăng theo ID
  static async getPostById(enterpriseId, postId) {
    try {
      const query = `
        SELECT post_id as id, enterprise_id, title, content, status, created_at
        FROM posts
        WHERE enterprise_id = ? AND post_id = ?
      `;
      const [rows] = await db.query(query, [enterpriseId, postId]);
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy thông tin bài đăng:', error);
      throw error;
    }
  }

  // Tạo bài đăng mới
  static async createPost(postData) {
    try {
      const { enterprise_id, title, content } = postData;
      const query = `
        INSERT INTO posts (enterprise_id, title, content, status, created_at)
        VALUES (?, ?, ?, 'pending', NOW())
      `;
      const values = [enterprise_id, title, content];
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo bài đăng:', error);
      throw error;
    }
  }

  // Cập nhật bài đăng
  static async updatePost(enterpriseId, postId, postData) {
    try {
      const { title, content } = postData;
      const query = `
        UPDATE posts
        SET title = ?, content = ?
        WHERE enterprise_id = ? AND post_id = ?
      `;
      const values = [title, content, enterpriseId, postId];
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật bài đăng:', error);
      throw error;
    }
  }

  // Xóa bài đăng
  static async deletePost(enterpriseId, postId) {
    try {
      const query = `
        DELETE FROM posts
        WHERE enterprise_id = ? AND post_id = ?
      `;
      const [result] = await db.query(query, [enterpriseId, postId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa bài đăng:', error);
      throw error;
    }
  }

  // Lấy danh sách đặt chỗ của doanh nghiệp
  static async getBookings(enterpriseId, status = null) {
    try {
      let query = `
        SELECT 
          b.booking_id,
          b.event_id,
          b.number_of_people,
          b.booking_time,
          b.notes,
          b.status,
          e.name as event_name,
          u.full_name as booker_name,
          u.phone as booker_phone,
          u.email as booker_email
        FROM BOOKINGS b
        JOIN EVENTS e ON b.event_id = e.event_id
        JOIN USERS u ON b.booker_id = u.user_id
        WHERE b.enterprise_id = ?
      `;
      
      const params = [enterpriseId];
      
      if (status) {
        query += ' AND b.status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY b.booking_id DESC';
      
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
      throw error;
    }
  }

  // Lấy đặt chỗ theo ID
  static async getBookingById(enterpriseId, bookingId) {
    try {
      const query = `
        SELECT 
          b.booking_id,
          b.event_id,
          b.number_of_people,
          b.booking_time,
          b.notes,
          b.status,
          e.name as event_name,
          u.full_name as booker_name,
          u.phone as booker_phone,
          u.email as booker_email
        FROM BOOKINGS b
        JOIN EVENTS e ON b.event_id = e.event_id
        JOIN USERS u ON b.booker_id = u.user_id
        WHERE b.enterprise_id = ? AND b.booking_id = ?
      `;
      const [rows] = await db.query(query, [enterpriseId, bookingId]);
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đặt chỗ:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái đặt chỗ
  static async updateBookingStatus(enterpriseId, bookingId, status) {
    try {
      const query = `
        UPDATE BOOKINGS
        SET status = ?
        WHERE enterprise_id = ? AND booking_id = ?
      `;
      const values = [status, enterpriseId, bookingId];
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đặt chỗ:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái doanh nghiệp (cho admin duyệt)
  static async updateStatus(enterpriseId, status) {
    try {
      const query = `
        UPDATE enterprises
        SET status = ?, updated_at = NOW()
        WHERE enterprise_id = ?
      `;
      const [result] = await db.query(query, [status, enterpriseId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái doanh nghiệp:', error);
      throw error;
    }
  }
}

module.exports = Enterprise; 