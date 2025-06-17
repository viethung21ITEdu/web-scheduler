const db = require('../utils/db');

class Event {
  // Lấy tất cả sự kiện
  static async getAll() {
    try {
      const query = `
        SELECT e.*, g.name as group_name
        FROM events e
        JOIN \`groups\` g ON e.group_id = g.group_id
        ORDER BY e.start_time DESC
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sự kiện:', error);
      throw error;
    }
  }

  // Lấy sự kiện theo ID
  static async getById(id) {
    try {
      const query = `
        SELECT e.*, g.name as group_name
        FROM events e
        JOIN \`groups\` g ON e.group_id = g.group_id
        WHERE e.event_id = ?
      `;
      const [rows] = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sự kiện:', error);
      throw error;
    }
  }

  // Lấy sự kiện theo group_id
  static async getByGroupId(groupId) {
    try {
      const query = `
        SELECT *
        FROM events
        WHERE group_id = ?
        ORDER BY start_time DESC
      `;
      const [rows] = await db.query(query, [groupId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sự kiện của nhóm:', error);
      throw error;
    }
  }

  // Tạo sự kiện mới
  static async create(eventData) {
    try {
      console.log('📝 Event model - Received data:', eventData);
      const { group_id, name, start_time, end_time, venue, status, timeslots, participants, match_rate } = eventData;
      const query = `
        INSERT INTO events (group_id, name, start_time, end_time, venue, status, timeslots, participants, match_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [group_id, name, start_time, end_time, venue, status || 'planned', timeslots, participants, match_rate];
      console.log('📝 Event model - Query:', query);
      console.log('📝 Event model - Values:', values);
      
      const [result] = await db.query(query, values);
      console.log('✅ Event model - Insert result:', result);
      return result.insertId;
    } catch (error) {
      console.error('❌ Event model - Lỗi khi tạo sự kiện:', error);
      console.error('❌ Event model - Error stack:', error.stack);
      throw error;
    }
  }

  // Cập nhật thông tin sự kiện
  static async update(id, eventData) {
    try {
      const { name, start_time, end_time, venue, status, timeslots, match_rate } = eventData;
      const query = `
        UPDATE events
        SET name = ?, start_time = ?, end_time = ?, venue = ?, status = ?, timeslots = ?, match_rate = ?
        WHERE event_id = ?
      `;
      const values = [name, start_time, end_time, venue, status, timeslots, match_rate, id];
      
      console.log('📝 Event model - Update query:', query);
      console.log('📝 Event model - Update values:', values);
      
      const [result] = await db.query(query, values);
      
      console.log('📝 Event model - Update result:', result);
      console.log('📝 Event model - Affected rows:', result.affectedRows);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Event model - Lỗi khi cập nhật thông tin sự kiện:', error);
      throw error;
    }
  }

  // Cập nhật chỉ match_rate
  static async updateMatchRate(eventId, matchRate) {
    try {
      const query = `UPDATE events SET match_rate = ? WHERE event_id = ?`;
      const [result] = await db.query(query, [matchRate, eventId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật match_rate:', error);
      throw error;
    }
  }

  // Xóa sự kiện
  static async delete(id) {
    try {
      // Xóa tất cả các đặt chỗ liên quan đến sự kiện này trước
      await db.query('DELETE FROM bookings WHERE event_id = ?', [id]);
      
      // Sau đó xóa sự kiện
      const query = `
        DELETE FROM events
        WHERE event_id = ?
      `;
      const [result] = await db.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa sự kiện:', error);
      throw error;
    }
  }

  // Lấy danh sách đặt chỗ cho sự kiện
  static async getBookings(eventId) {
    try {
      const query = `
        SELECT b.*, en.name as enterprise_name, u.full_name as booker_name
        FROM bookings b
        JOIN enterprises en ON b.enterprise_id = en.enterprise_id
        JOIN users u ON b.booker_id = u.user_id
        WHERE b.event_id = ?
        ORDER BY b.booking_id DESC
      `;
      const [rows] = await db.query(query, [eventId]);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
      throw error;
    }
  }

  // Tạo đặt chỗ mới cho sự kiện
  static async createBooking(bookingData) {
    try {
      const { event_id, enterprise_id, booker_id, number_of_people, booking_time, notes } = bookingData;
      const query = `
        INSERT INTO bookings (event_id, enterprise_id, booker_id, number_of_people, booking_time, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `;
      const values = [event_id, enterprise_id, booker_id, number_of_people, booking_time, notes];
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo đặt chỗ:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái đặt chỗ
  static async updateBookingStatus(bookingId, status) {
    try {
      const query = `
        UPDATE bookings
        SET status = ?
        WHERE booking_id = ?
      `;
      const values = [status, bookingId];
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đặt chỗ:', error);
      throw error;
    }
  }

  // Lấy danh sách sự kiện sắp tới
  static async getUpcoming() {
    try {
      const query = `
        SELECT e.*, g.name as group_name
        FROM events e
        JOIN \`groups\` g ON e.group_id = g.group_id
        WHERE e.start_time > NOW()
        ORDER BY e.start_time ASC
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sự kiện sắp tới:', error);
      throw error;
    }
  }

  // Kiểm tra xem user đã tham gia sự kiện chưa
  static async checkParticipation(eventId, userId) {
    try {
      console.log('🔍 Checking participation:', { eventId, userId });
      
      const [event] = await db.query('SELECT participants FROM events WHERE event_id = ?', [eventId]);
      
      if (event.length === 0) {
        return false;
      }
      
      let participants = [];
      
      if (event[0].participants) {
        try {
          if (typeof event[0].participants === 'string') {
            participants = JSON.parse(event[0].participants);
          } else if (Array.isArray(event[0].participants)) {
            participants = event[0].participants;
          }
        } catch (parseError) {
          console.error('❌ Error parsing participants JSON:', parseError);
          return false;
        }
      }
      
      const isParticipating = participants.includes(parseInt(userId));
      console.log('🔍 User participation status:', isParticipating);
      return isParticipating;
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra tham gia sự kiện:', error);
      return false;
    }
  }

  // Thêm người tham gia sự kiện
  static async addParticipant(eventId, userId) {
    try {
      console.log('🔍 Adding participant:', { eventId, userId });
      
      // Lấy danh sách participants hiện tại
      const [event] = await db.query('SELECT participants FROM events WHERE event_id = ?', [eventId]);
      
      if (event.length === 0) {
        throw new Error('Sự kiện không tồn tại');
      }
      
      console.log('🔍 Current participants data:', event[0].participants);
      
      let participants = [];
      
      // Xử lý participants an toàn hơn
      if (event[0].participants) {
        try {
          if (typeof event[0].participants === 'string') {
            participants = JSON.parse(event[0].participants);
          } else if (Array.isArray(event[0].participants)) {
            participants = event[0].participants;
          } else {
            participants = [];
          }
        } catch (parseError) {
          console.error('❌ Error parsing participants JSON:', parseError);
          participants = [];
        }
      }
      
      console.log('🔍 Parsed participants:', participants);
      
      // Kiểm tra xem user đã tham gia chưa
      if (participants.includes(parseInt(userId))) {
        console.log('✅ User already participating');
        return true; // Đã tham gia rồi
      }
      
      // Thêm user vào danh sách
      participants.push(parseInt(userId));
      console.log('🔍 Updated participants:', participants);
      
      // Cập nhật lại database
      const updateQuery = `
        UPDATE events 
        SET participants = ? 
        WHERE event_id = ?
      `;
      const [result] = await db.query(updateQuery, [JSON.stringify(participants), eventId]);
      console.log('✅ Update result:', result);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Lỗi khi thêm người tham gia sự kiện:', error);
      throw error;
    }
  }

  // Lấy số lượng người tham gia sự kiện
  static async getParticipantCount(eventId) {
    try {
      console.log('🔍 Getting participant count for event:', eventId);
      
      const query = `
        SELECT participants 
        FROM events 
        WHERE event_id = ?
      `;
      const [rows] = await db.query(query, [eventId]);
      
      if (rows.length === 0) {
        console.log('🔍 Event not found');
        return 0;
      }
      
      const participants = rows[0].participants;
      console.log('🔍 Raw participants data:', participants);
      
      if (!participants) {
        console.log('🔍 No participants data');
        return 0;
      }
      
      try {
        let participantList = [];
        if (typeof participants === 'string') {
          participantList = JSON.parse(participants);
        } else if (Array.isArray(participants)) {
          participantList = participants;
        } else {
          participantList = [];
        }
        
        console.log('🔍 Parsed participant list:', participantList);
        return participantList.length;
      } catch (parseError) {
        console.error('❌ Error parsing participants JSON:', parseError);
        return 0;
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy số lượng người tham gia:', error);
      return 0; // Trả về 0 thay vì throw error để không làm crash API
    }
  }

  // Kiểm tra trạng thái thông báo của sự kiện
  static async getNotificationStatus(eventId) {
    try {
      const query = `
        SELECT status, created_at, success_count, fail_count
        FROM notifications 
        WHERE event_id = ? AND status = 'sent'
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const [rows] = await db.query(query, [eventId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thông báo:', error);
      throw error;
    }
  }

  /**
   * Lấy các sự kiện diễn ra trong khoảng thời gian cụ thể (dựa trên start_time và end_time)
   * @param {Date} startDate - Thời gian bắt đầu của khoảng thời gian
   * @param {Date} endDate - Thời gian kết thúc của khoảng thời gian
   * @returns {Array} Danh sách các sự kiện
   */
  static async getEventsByTimeRange(startDate, endDate) {
    try {
      const query = `
        SELECT *
        FROM events
        WHERE (
          (start_time >= ? AND start_time <= ?) OR
          (end_time >= ? AND end_time <= ?) OR
          (start_time <= ? AND end_time >= ?)
        )
        AND status != 'cancelled'
      `;
      
      const [rows] = await db.execute(query, [
        startDate, endDate,
        startDate, endDate,
        startDate, startDate
      ]);
      
      return rows;
    } catch (error) {
      console.error('❌ Error getting events by time range:', error);
      throw error;
    }
  }

  /**
   * Lấy các sự kiện diễn ra trong khoảng thời gian cụ thể (dựa trên trường timeslots JSON)
   * @param {Date} startDate - Thời gian bắt đầu của khoảng thời gian
   * @param {Date} endDate - Thời gian kết thúc của khoảng thời gian
   * @returns {Array} Danh sách các sự kiện
   */
  static async getEventsByTimeslots(startDate, endDate) {
    try {
      // Format ngày tháng để so sánh
      const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Lấy tất cả sự kiện có timeslots
      const query = `
        SELECT *
        FROM events
        WHERE timeslots IS NOT NULL
        AND status != 'cancelled'
      `;
      
      const [rows] = await db.execute(query);
      
      // Lọc các sự kiện có timeslots trong khoảng thời gian
      const filteredEvents = rows.filter(event => {
        try {
          // Parse timeslots
          const timeslots = typeof event.timeslots === 'string' 
            ? JSON.parse(event.timeslots) 
            : event.timeslots;
          
          // Kiểm tra từng slot
          if (timeslots && timeslots.slots && Array.isArray(timeslots.slots)) {
            return timeslots.slots.some(slot => {
              // So sánh ngày
              const slotDate = slot.date; // YYYY-MM-DD
              return slotDate >= startDateStr && slotDate <= endDateStr;
            });
          }
          
          return false;
        } catch (error) {
          console.error(`❌ Error parsing timeslots for event ${event.event_id}:`, error);
          return false;
        }
      });
      
      return filteredEvents;
    } catch (error) {
      console.error('❌ Error getting events by timeslots:', error);
      throw error;
    }
  }
}

module.exports = Event; 