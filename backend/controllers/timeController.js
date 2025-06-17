const Time = require('../models/timeModel');

// Lấy tất cả timeslots của user hiện tại trong một nhóm cụ thể
exports.getUserTimeslots = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID là bắt buộc'
      });
    }
    
    const timeslots = await Time.getUserTimeslots(userId, parseInt(groupId));
    
    res.status(200).json({
      success: true,
      data: timeslots,
      message: 'Lấy danh sách thời gian thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy timeslots:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách thời gian'
    });
  }
};

// Lấy tất cả timeslots của user hiện tại (không phân biệt nhóm)
exports.getAllUserTimeslots = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const timeslots = await Time.getAllUserTimeslots(userId);
    
    res.status(200).json({
      success: true,
      data: timeslots,
      message: 'Lấy danh sách thời gian thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả timeslots:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách thời gian'
    });
  }
};

// Tạo timeslot mới
exports.createTimeslot = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { start_time, end_time, group_id } = req.body;

    console.log('- Extracted userId:', userId);
    console.log('- Extracted data:', { start_time, end_time, group_id });

    // Validate required fields
    if (!start_time || !end_time || !group_id) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Thời gian bắt đầu, kết thúc và group_id là bắt buộc'
      });
    }

    // Validate time logic
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian bắt đầu phải trước thời gian kết thúc'
      });
    }

    const timeslotData = {
      user_id: userId,
      group_id: parseInt(group_id),
      start_time,
      end_time
    };

    console.log('- Final timeslotData:', timeslotData);
    console.log('✅ About to call Time.createTimeslot');

    const timeslotId = await Time.createTimeslot(timeslotData);
    
    console.log('✅ Timeslot created successfully with ID:', timeslotId);
    
    res.status(201).json({
      success: true,
      data: { timeslot_id: timeslotId },
      message: 'Tạo thời gian thành công'
    });
  } catch (error) {
    console.error('❌ DETAILED ERROR in createTimeslot:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo thời gian'
    });
  }
};

// Cập nhật timeslot
exports.updateTimeslot = async (req, res) => {
  try {
    const timeslotId = req.params.id;
    const userId = req.user.user_id;
    const { start_time, end_time } = req.body;

    // Kiểm tra ownership
    const isOwner = await Time.isTimeslotOwner(timeslotId, userId);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa thời gian này'
      });
    }

    // Validate time logic if provided
    if (start_time && end_time && new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian bắt đầu phải trước thời gian kết thúc'
      });
    }

    const timeslotData = {
      start_time,
      end_time
    };

    const success = await Time.updateTimeslot(timeslotId, timeslotData);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Cập nhật thời gian thành công'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thời gian để cập nhật'
      });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật timeslot:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật thời gian'
    });
  }
};

// Xóa timeslot
exports.deleteTimeslot = async (req, res) => {
  try {
    const timeslotId = req.params.id;
    const userId = req.user.user_id;

    console.log('🗑️ DELETE timeslot request:');
    console.log('- timeslotId:', timeslotId);
    console.log('- userId:', userId);
    console.log('- req.user:', req.user);

    // Kiểm tra xem timeslot có tồn tại không
    const isOwner = await Time.isTimeslotOwner(timeslotId, userId);
    console.log('- isOwner check:', isOwner);

    if (!isOwner) {
      console.log('❌ Ownership check failed');
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa thời gian này hoặc thời gian không tồn tại'
      });
    }

    const success = await Time.deleteTimeslot(timeslotId, userId);
    console.log('- Delete result:', success);
    
    if (success) {
      console.log('✅ Delete successful');
      res.status(200).json({
        success: true,
        message: 'Xóa thời gian thành công'
      });
    } else {
      console.log('❌ Delete failed');
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thời gian để xóa'
      });
    }
  } catch (error) {
    console.error('❌ Lỗi khi xóa timeslot:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa thời gian'
    });
  }
};

// Lấy timeslots của tất cả thành viên trong nhóm
exports.getGroupTimeslots = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const timeslots = await Time.getGroupTimeslots(groupId);
    
    // Group by user
    const groupedTimeslots = timeslots.reduce((acc, slot) => {
      const userId = slot.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user_id: userId,
          username: slot.username,
          full_name: slot.full_name,
          timeslots: []
        };
      }
      acc[userId].timeslots.push({
        timeslot_id: slot.timeslot_id,
        start_time: slot.start_time,
        end_time: slot.end_time
      });
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      data: Object.values(groupedTimeslots),
      message: 'Lấy thời gian của nhóm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy timeslots của nhóm:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thời gian của nhóm'
    });
  }
};

// Lấy thời gian rảnh chung của nhóm
exports.getGroupAvailableTime = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Ngày bắt đầu và ngày kết thúc là bắt buộc'
      });
    }

    const result = await Time.getGroupAvailableTime(groupId, start_date, end_date);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Lấy thời gian rảnh chung thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy thời gian rảnh chung:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tìm thời gian rảnh chung'
    });
  }
}; 