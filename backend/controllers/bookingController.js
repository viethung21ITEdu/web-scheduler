const Booking = require('../models/bookingModel');
const db = require('../utils/db');
const { sendNewBookingNotification } = require('../services/emailService');

// Lấy tất cả đặt chỗ
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.getAll();
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đặt chỗ' });
  }
};

// Lấy đặt chỗ theo ID
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin đặt chỗ' });
  }
};

// Tạo đặt chỗ mới (cho Leader)
exports.createBooking = async (req, res) => {
  try {
    const { 
      event_id, 
      enterprise_id, 
      number_of_people, 
      booking_time, 
      notes 
    } = req.body;
    
    const booker_id = req.user.user_id;
    
    // Validate required fields
    if (!event_id || !enterprise_id || !number_of_people || !booking_time) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }
    
    // Kiểm tra event có tồn tại và thuộc về user không
    const [events] = await db.query(`
      SELECT e.*, m.user_id as leader_id
      FROM EVENTS e 
      JOIN \`GROUPS\` g ON e.group_id = g.group_id 
      JOIN MEMBERSHIPS m ON g.group_id = m.group_id 
      WHERE e.event_id = ? AND m.role_in_group = 'Leader'
    `, [event_id]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
    
    if (events[0].leader_id !== booker_id) {
      return res.status(403).json({ message: 'Bạn không có quyền đặt chỗ cho sự kiện này' });
    }
    
    // Kiểm tra enterprise có tồn tại không
    const [enterprises] = await db.query(`
      SELECT enterprise_id FROM ENTERPRISES WHERE enterprise_id = ?
    `, [enterprise_id]);
    
    if (enterprises.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp' });
    }
    
    // Lưu chuỗi thời gian đã format từ frontend
    let formattedBookingTime = booking_time || 'Chưa xác định thời gian';
    
    console.log('📅 Booking time (formatted string):', {
      original: booking_time,
      saved: formattedBookingTime
    });
    
    console.log('Original booking_time:', booking_time);
    console.log('Formatted booking_time:', formattedBookingTime);
    
    // Tạo booking mới
    const [result] = await db.query(`
      INSERT INTO BOOKINGS (event_id, enterprise_id, booker_id, number_of_people, booking_time, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [event_id, enterprise_id, booker_id, number_of_people, formattedBookingTime, notes]);
    
    // Gửi email thông báo cho doanh nghiệp
    try {
      // Lấy thông tin chi tiết để gửi email
      const [enterpriseUsers] = await db.query(`
        SELECT u.email, u.full_name, u.username, e.name as enterprise_name
        FROM ENTERPRISES e
        JOIN USERS u ON e.user_id = u.user_id
        WHERE e.enterprise_id = ?
      `, [enterprise_id]);
      
      if (enterpriseUsers.length > 0 && enterpriseUsers[0].email) {
        const enterpriseUser = enterpriseUsers[0];
        
        // Lấy thông tin event và group
        const event = events[0]; // Đã có từ validation ở trên
        const [groups] = await db.query(`
          SELECT * FROM \`GROUPS\` WHERE group_id = ?
        `, [event.group_id]);
        
        // Lấy thông tin leader
        const [leaders] = await db.query(`
          SELECT u.* FROM USERS u
          WHERE u.user_id = ?
        `, [booker_id]);
        
        if (groups.length > 0 && leaders.length > 0) {
          const bookingData = {
            number_of_people,
            booking_time: formattedBookingTime,
            notes
          };
          
          const eventData = {
            name: event.name
          };
          
          const groupData = {
            name: groups[0].name
          };
          
          const leaderData = leaders[0];
          
          // Gửi email
          const emailResult = await sendNewBookingNotification(
            bookingData,
            eventData, 
            groupData,
            leaderData,
            enterpriseUser.email
          );
          
          if (emailResult.success) {
            console.log('✅ Email thông báo đặt chỗ đã gửi thành công cho doanh nghiệp');
          } else {
            console.log('❌ Không thể gửi email thông báo:', emailResult.error);
          }
        }
      }
    } catch (emailError) {
      console.error('❌ Lỗi khi gửi email thông báo cho doanh nghiệp:', emailError);
      // Không throw error vì booking đã tạo thành công
    }
    
    res.status(201).json({
      message: 'Tạo đặt chỗ thành công',
      booking_id: result.insertId
    });
    
  } catch (error) {
    console.error('Lỗi khi tạo booking:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin đặt chỗ
exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { number_of_people, booking_time, notes, status } = req.body;

    // Kiểm tra xem đặt chỗ có tồn tại không
    const existingBooking = await Booking.getById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    // Lưu chuỗi thời gian đã format từ frontend
    let formattedBookingTime = booking_time || existingBooking.booking_time;
    
    console.log('📅 Update booking time (formatted string):', {
      original: booking_time,
      saved: formattedBookingTime
    });

    // Cập nhật thông tin đặt chỗ
    const bookingData = {
      number_of_people: number_of_people || existingBooking.number_of_people,
      booking_time: formattedBookingTime,
      notes: notes !== undefined ? notes : existingBooking.notes,
      status: status || existingBooking.status
    };

    const success = await Booking.update(bookingId, bookingData);
    
    if (success) {
      res.status(200).json({ message: 'Cập nhật thông tin đặt chỗ thành công' });
    } else {
      res.status(400).json({ message: 'Không thể cập nhật thông tin đặt chỗ' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thông tin đặt chỗ' });
  }
};

// Cập nhật trạng thái đặt chỗ
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Trạng thái là bắt buộc' });
    }

    // Kiểm tra xem đặt chỗ có tồn tại không
    const existingBooking = await Booking.getById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    const success = await Booking.updateStatus(bookingId, status);
    
    if (success) {
      res.status(200).json({ message: 'Cập nhật trạng thái đặt chỗ thành công' });
    } else {
      res.status(400).json({ message: 'Không thể cập nhật trạng thái đặt chỗ' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật trạng thái đặt chỗ' });
  }
};

// Xóa đặt chỗ
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Kiểm tra xem đặt chỗ có tồn tại không
    const existingBooking = await Booking.getById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }

    const success = await Booking.delete(bookingId);
    
    if (success) {
      res.status(200).json({ message: 'Hủy đặt chỗ thành công' });
    } else {
      res.status(400).json({ message: 'Không thể hủy đặt chỗ' });
    }
  } catch (error) {
    console.error('Lỗi khi hủy đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi hủy đặt chỗ' });
  }
};

// Lấy danh sách đặt chỗ theo người dùng
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookings = await Booking.getByUserId(userId);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ của người dùng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đặt chỗ của người dùng' });
  }
};

// Lấy danh sách đặt chỗ theo doanh nghiệp
exports.getEnterpriseBookings = async (req, res) => {
  try {
    const enterpriseId = req.params.enterpriseId;
    const bookings = await Booking.getByEnterpriseId(enterpriseId);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ của doanh nghiệp:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đặt chỗ của doanh nghiệp' });
  }
};

// Lấy danh sách đặt chỗ theo sự kiện
exports.getEventBookings = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const bookings = await Booking.getByEventId(eventId);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ của sự kiện:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đặt chỗ của sự kiện' });
  }
};

// Lấy danh sách booking của Leader
exports.getMyBookings = async (req, res) => {
  try {
    const booker_id = req.user.user_id;
    
    const [bookings] = await db.query(`
      SELECT 
        b.booking_id,
        b.event_id,
        b.number_of_people,
        b.booking_time,
        b.notes,
        b.status,
        e.name as event_name,
        ent.name as enterprise_name,
        ent.phone as enterprise_phone
      FROM BOOKINGS b
      JOIN EVENTS e ON b.event_id = e.event_id
      JOIN ENTERPRISES ent ON b.enterprise_id = ent.enterprise_id
      WHERE b.booker_id = ?
      ORDER BY b.booking_id DESC
    `, [booker_id]);
    
    res.json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách booking:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách enterprises để chọn
exports.getEnterprises = async (req, res) => {
  try {
    const [enterprises] = await db.query(`
      SELECT 
        enterprise_id,
        name,
        enterprise_type,
        phone,
        address,
        opening_hours,
        capacity
      FROM ENTERPRISES
      ORDER BY name
    `);
    
    res.json(enterprises);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách enterprises:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};