const Event = require('../models/eventModel');

// Lấy tất cả sự kiện
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAll();
    res.status(200).json(events);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sự kiện:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách sự kiện' });
  }
};

// Lấy sự kiện theo ID
exports.getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.getById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
    
    // Thêm thông tin số lượng người tham gia
    const participantCount = await Event.getParticipantCount(eventId);
    const eventWithParticipants = {
      ...event,
      participant_count: participantCount || 0,
      attendeeCount: participantCount || 0 // Thêm alias để tương thích
    };
    
    res.status(200).json(eventWithParticipants);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sự kiện:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin sự kiện' });
  }
};

// Tạo sự kiện mới
exports.createEvent = async (req, res) => {
  try {
    console.log('📝 Received request body:', req.body);
    const { group_id, name, start_time, end_time, venue, status, timeslots, match_rate } = req.body;

    // Chỉ yêu cầu group_id và name là bắt buộc
    if (!group_id || !name) {
      console.log('❌ Missing required fields:', { group_id, name });
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (group_id và name)' });
    }

    const eventData = {
      group_id,
      name,
      start_time: start_time || null,
      end_time: end_time || null,
      venue: venue !== undefined ? venue : null,  // Giữ nguyên null nếu venue là null
      status: status || 'planned',
      timeslots: timeslots ? JSON.stringify(timeslots) : null,
      participants: req.user && req.user.user_id ? JSON.stringify([req.user.user_id]) : null,
      match_rate: match_rate || null
    };

    console.log('📝 Event data with timeslots:', eventData);

    console.log('📝 Prepared event data:', eventData);

    const eventId = await Event.create(eventData);
    
    console.log('✅ Event created successfully with ID:', eventId);
    console.log('✅ Leader automatically added to participants list');
    
    res.status(201).json({
      message: 'Tạo sự kiện thành công',
      event_id: eventId
    });
  } catch (error) {
    console.error('❌ Lỗi khi tạo sự kiện:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo sự kiện' });
  }
};

// Cập nhật thông tin sự kiện
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, start_time, end_time, venue, status, timeslots } = req.body;

    console.log('📝 Update event request:', { eventId, body: req.body });

    // Kiểm tra xem sự kiện có tồn tại không
    const existingEvent = await Event.getById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    console.log('📝 Existing event:', existingEvent);

    // Cập nhật thông tin sự kiện - sử dụng !== undefined để cho phép null
    const eventData = {
      name: name !== undefined ? name : existingEvent.name,
      start_time: start_time !== undefined ? start_time : existingEvent.start_time,
      end_time: end_time !== undefined ? end_time : existingEvent.end_time,
      venue: venue !== undefined ? venue : existingEvent.venue,  // Giữ nguyên null nếu venue là null
      status: status !== undefined ? status : existingEvent.status,
      timeslots: timeslots !== undefined ? (timeslots ? JSON.stringify(timeslots) : null) : existingEvent.timeslots,
      match_rate: req.body.match_rate !== undefined ? req.body.match_rate : existingEvent.match_rate
    };

    console.log('📝 Event data to update:', eventData);

    const success = await Event.update(eventId, eventData);
    
    if (success) {
      res.status(200).json({ message: 'Cập nhật thông tin sự kiện thành công' });
    } else {
      res.status(400).json({ message: 'Không thể cập nhật thông tin sự kiện' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin sự kiện:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thông tin sự kiện' });
  }
};

// Cập nhật match_rate cho sự kiện
exports.updateEventMatchRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { match_rate } = req.body;

    console.log('📝 Updating match_rate for event ID:', id, 'to:', match_rate);

    if (match_rate < 0 || match_rate > 100) {
      return res.status(400).json({ message: 'Match rate phải từ 0 đến 100' });
    }

    const success = await Event.updateMatchRate(id, match_rate);
    
    if (success) {
      res.json({ 
        success: true,
        message: 'Cập nhật tỷ lệ phù hợp thành công',
        match_rate 
      });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật match_rate:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật tỷ lệ phù hợp' });
  }
};

// Xóa sự kiện
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Kiểm tra xem sự kiện có tồn tại không
    const existingEvent = await Event.getById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }

    const success = await Event.delete(eventId);
    
    if (success) {
      res.status(200).json({ message: 'Xóa sự kiện thành công' });
    } else {
      res.status(400).json({ message: 'Không thể xóa sự kiện' });
    }
  } catch (error) {
    console.error('Lỗi khi xóa sự kiện:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa sự kiện' });
  }
};

// Lấy danh sách đặt chỗ cho sự kiện
exports.getEventBookings = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Kiểm tra xem sự kiện có tồn tại không
    const existingEvent = await Event.getById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
    
    const bookings = await Event.getBookings(eventId);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đặt chỗ' });
  }
};

// Tạo đặt chỗ mới cho sự kiện
exports.createBooking = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { enterprise_id, booker_id, number_of_people, booking_time, notes } = req.body;
    
    if (!enterprise_id || !booker_id || !number_of_people || !booking_time) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    
    // Kiểm tra xem sự kiện có tồn tại không
    const existingEvent = await Event.getById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
    
    // Tạo đặt chỗ mới
    const bookingData = {
      event_id: eventId,
      enterprise_id,
      booker_id,
      number_of_people,
      booking_time,
      notes
    };
    
    const bookingId = await Event.createBooking(bookingData);
    
    res.status(201).json({
      message: 'Đặt chỗ thành công',
      booking_id: bookingId
    });
  } catch (error) {
    console.error('Lỗi khi đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đặt chỗ' });
  }
};

// Cập nhật trạng thái đặt chỗ
exports.updateBookingStatus = async (req, res) => {
  try {
    const eventId = req.params.id;
    const bookingId = req.params.bookingId;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Trạng thái là bắt buộc' });
    }
    
    // Kiểm tra xem sự kiện có tồn tại không
    const existingEvent = await Event.getById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
    
    const success = await Event.updateBookingStatus(bookingId, status);
    
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

// Lấy danh sách sự kiện của một nhóm
exports.getEventsByGroupId = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const events = await Event.getByGroupId(groupId);
    
    // Thêm thông tin trạng thái thông báo và số lượng thành viên cho mỗi sự kiện
    const eventsWithNotificationStatus = await Promise.all(
      events.map(async (event) => {
        const notificationStatus = await Event.getNotificationStatus(event.event_id);
        const participantCount = await Event.getParticipantCount(event.event_id);
        return {
          ...event,
          notification_status: notificationStatus ? 'sent' : 'not_sent',
          notification_sent_at: notificationStatus ? notificationStatus.created_at : null,
          notification_success_count: notificationStatus ? notificationStatus.success_count : 0,
          notification_fail_count: notificationStatus ? notificationStatus.fail_count : 0,
          participant_count: participantCount || 0
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: eventsWithNotificationStatus,
      message: 'Lấy danh sách sự kiện của nhóm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sự kiện của nhóm:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách sự kiện của nhóm' 
    });
  }
};

// Tham gia sự kiện
exports.participateInEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.user_id;
    
    // Kiểm tra xem sự kiện có tồn tại không
    const existingEvent = await Event.getById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
    }
    
    // Kiểm tra xem user đã tham gia chưa trước khi thêm
    const isAlreadyParticipating = await Event.checkParticipation(eventId, userId);
    
    if (isAlreadyParticipating) {
      // User đã tham gia rồi, trả về thông báo và số lượng hiện tại
      const participantCount = await Event.getParticipantCount(eventId);
      return res.status(200).json({ 
        message: 'Bạn đã tham gia sự kiện này rồi',
        participantCount: participantCount,
        alreadyParticipating: true
      });
    }
    
    // Thêm user vào danh sách tham gia sự kiện
    const success = await Event.addParticipant(eventId, userId);
    
    if (success) {
      // Lấy số lượng người tham gia hiện tại
      const participantCount = await Event.getParticipantCount(eventId);
      
      // Gửi email xác nhận tham gia
      try {
        const User = require('../models/userModel');
        const Group = require('../models/groupModel');
        const { sendEventParticipationConfirmation } = require('../services/emailService');
        
        // Lấy thông tin user
        const user = await User.getById(userId);
        
        // Lấy thông tin nhóm
        const group = await Group.getById(existingEvent.group_id);
        
        if (user && group && user.email) {
          // Format thời gian sự kiện
          let formattedTime = 'Chưa xác định thời gian';
          if (existingEvent.timeslots) {
            try {
              const timeslots = typeof existingEvent.timeslots === 'string' 
                ? JSON.parse(existingEvent.timeslots) 
                : existingEvent.timeslots;
              
              if (timeslots.type === 'single') {
                const slot = timeslots.slots[0];
                const [year, month, day] = slot.date.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                formattedTime = `${slot.day_name} ${formattedDate} (${slot.start_time} - ${slot.end_time})`;
              } else {
                // Multiple slots - hiển thị tóm tắt
                const firstSlot = timeslots.slots[0];
                const lastSlot = timeslots.slots[timeslots.slots.length - 1];
                formattedTime = `${firstSlot.day_name} ${firstSlot.start_time} - ${lastSlot.day_name} ${lastSlot.end_time} (${timeslots.slots.length} khung giờ)`;
              }
            } catch (error) {
              console.error('❌ Lỗi parse timeslots:', error);
              // Fallback về legacy format
              if (existingEvent.start_time && existingEvent.end_time) {
                const startDate = new Date(existingEvent.start_time);
                const endDate = new Date(existingEvent.end_time);
                formattedTime = `${startDate.toLocaleDateString('vi-VN')} ${startDate.toLocaleTimeString('vi-VN')} - ${endDate.toLocaleTimeString('vi-VN')}`;
              }
            }
          } else if (existingEvent.start_time && existingEvent.end_time) {
            // Legacy format
            const startDate = new Date(existingEvent.start_time);
            const endDate = new Date(existingEvent.end_time);
            formattedTime = `${startDate.toLocaleDateString('vi-VN')} ${startDate.toLocaleTimeString('vi-VN')} - ${endDate.toLocaleTimeString('vi-VN')}`;
          }
          
          const eventData = {
            name: existingEvent.name,
            venue: existingEvent.venue,
            time: formattedTime
          };
          
          const groupData = {
            group_id: group.group_id,
            name: group.name
          };
          
          // Gửi email xác nhận tham gia
          const emailResult = await sendEventParticipationConfirmation(user, eventData, groupData);
          
          if (emailResult.success) {
            console.log('✅ Email xác nhận tham gia đã được gửi:', emailResult.messageId);
          } else {
            console.error('❌ Không thể gửi email xác nhận tham gia:', emailResult.error);
          }
        }
      } catch (emailError) {
        console.error('❌ Lỗi khi gửi email xác nhận tham gia:', emailError);
        // Không làm gián đoạn flow chính, chỉ log lỗi
      }
      
      res.status(200).json({ 
        message: 'Đã xác nhận tham gia sự kiện',
        participantCount: participantCount,
        alreadyParticipating: false
      });
    } else {
      res.status(400).json({ message: 'Không thể xác nhận tham gia sự kiện' });
    }
  } catch (error) {
    console.error('Lỗi khi tham gia sự kiện:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tham gia sự kiện' });
  }
}; 