const Event = require('../models/eventModel');
const Group = require('../models/groupModel');
const Notification = require('../models/notificationModel');
const { sendEventNotification } = require('../services/emailService');

// Gửi thông báo sự kiện qua email
exports.sendEventNotification = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { customContent } = req.body; // Nhận custom content từ request body
    
    console.log('📧 Sending event notification for event:', eventId);
    
    // Lấy thông tin sự kiện
    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy sự kiện' 
      });
    }
    
    // Lấy thông tin nhóm
    const group = await Group.getById(event.group_id);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy nhóm' 
      });
    }
    
    // Lấy danh sách thành viên nhóm
    const members = await Group.getMembers(event.group_id);
    if (!members || members.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nhóm không có thành viên nào' 
      });
    }
    
    // Format thời gian sự kiện
    let formattedTime = 'Chưa xác định thời gian';
    if (event.timeslots) {
      try {
        const timeslots = typeof event.timeslots === 'string' 
          ? JSON.parse(event.timeslots) 
          : event.timeslots;
        
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
        if (event.start_time && event.end_time) {
          const startDate = new Date(event.start_time);
          const endDate = new Date(event.end_time);
          formattedTime = `${startDate.toLocaleDateString('vi-VN')} ${startDate.toLocaleTimeString('vi-VN')} - ${endDate.toLocaleTimeString('vi-VN')}`;
        }
      }
    } else if (event.start_time && event.end_time) {
      // Legacy format
      const startDate = new Date(event.start_time);
      const endDate = new Date(event.end_time);
      formattedTime = `${startDate.toLocaleDateString('vi-VN')} ${startDate.toLocaleTimeString('vi-VN')} - ${endDate.toLocaleTimeString('vi-VN')}`;
    }
    
    // Chuẩn bị dữ liệu sự kiện cho email
    const eventData = {
      name: event.name,
      venue: event.venue,
      time: formattedTime
    };
    
    const groupData = {
      group_id: group.group_id,
      name: group.name
    };
    
    console.log('📧 Event data:', eventData);
    console.log('📧 Group data:', groupData);
    console.log('📧 Recipients:', members.length);
    console.log('📧 Custom content:', customContent);
    
    // Gửi email thông báo
    const emailResult = await sendEventNotification(eventData, groupData, members, customContent);
    
    if (emailResult.success) {
      // Lưu thông báo vào database
      try {
        const notificationData = {
          event_id: eventId,
          title: customContent?.subject || `Thông báo sự kiện: ${event.name}`,
          content: customContent?.subtitle || 'Thông báo sự kiện đã được gửi đến các thành viên',
          status: 'sent',
          recipients_count: emailResult.totalRecipients,
          success_count: emailResult.successCount,
          fail_count: emailResult.failCount
        };
        
        const notificationId = await Notification.create(notificationData);
        console.log('✅ Notification saved to database with ID:', notificationId);
      } catch (dbError) {
        console.error('❌ Error saving notification to database:', dbError);
        // Không return error vì email đã gửi thành công
      }
      
      res.status(200).json({
        success: true,
        message: 'Gửi thông báo thành công',
        data: {
          totalRecipients: emailResult.totalRecipients,
          successCount: emailResult.successCount,
          failCount: emailResult.failCount
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi gửi email',
        error: emailResult.error
      });
    }
    
  } catch (error) {
    console.error('❌ Error in sendEventNotification:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi gửi thông báo',
      error: error.message
    });
  }
};

// Test email service
exports.testEmailService = async (req, res) => {
  try {
    const { testEmailConnection } = require('../services/emailService');
    const isReady = await testEmailConnection();
    
    if (isReady) {
      res.status(200).json({
        success: true,
        message: 'Email service is ready'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email service is not configured properly'
      });
    }
  } catch (error) {
    console.error('❌ Error testing email service:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing email service',
      error: error.message
    });
  }
};

// Lấy danh sách thông báo của một sự kiện
exports.getEventNotifications = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const notifications = await Notification.getByEventId(eventId);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('❌ Error getting event notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách thông báo',
      error: error.message
    });
  }
};

// Lấy danh sách thông báo của một nhóm
exports.getGroupNotifications = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const notifications = await Notification.getByGroupId(groupId);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('❌ Error getting group notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách thông báo nhóm',
      error: error.message
    });
  }
};

// Lấy thống kê thông báo
exports.getNotificationStats = async (req, res) => {
  try {
    const { groupId } = req.query;
    
    const stats = await Notification.getStats(groupId);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thống kê thông báo',
      error: error.message
    });
  }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const deleted = await Notification.delete(notificationId);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Xóa thông báo thành công'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xóa thông báo',
      error: error.message
    });
  }
}; 