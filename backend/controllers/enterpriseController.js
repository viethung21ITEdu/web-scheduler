const Enterprise = require('../models/enterpriseModel');
const { sendBookingApprovedNotification } = require('../services/emailService');
const db = require('../utils/db');

// Lấy tất cả doanh nghiệp
exports.getAllEnterprises = async (req, res) => {
  try {
    const enterprises = await Enterprise.getAll();
    res.status(200).json(enterprises);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách doanh nghiệp:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách doanh nghiệp' });
  }
};

// Lấy doanh nghiệp theo ID
exports.getEnterpriseById = async (req, res) => {
  try {
    const enterpriseId = req.params.id;
    const enterprise = await Enterprise.getById(enterpriseId);
    
    if (!enterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp' });
    }
    
    res.status(200).json(enterprise);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin doanh nghiệp:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin doanh nghiệp' });
  }
};

// Tạo doanh nghiệp mới
exports.createEnterprise = async (req, res) => {
  try {
    const { user_id, name, enterprise_type, contact_person, phone } = req.body;

    if (!user_id || !name || !enterprise_type) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const enterpriseData = {
      user_id,
      name,
      enterprise_type,
      contact_person,
      phone
    };

    const enterpriseId = await Enterprise.create(enterpriseData);
    
    res.status(201).json({
      message: 'Tạo doanh nghiệp thành công',
      enterprise_id: enterpriseId
    });
  } catch (error) {
    console.error('Lỗi khi tạo doanh nghiệp:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo doanh nghiệp' });
  }
};

// Cập nhật thông tin doanh nghiệp
exports.updateEnterprise = async (req, res) => {
  try {
    const enterpriseId = req.params.id;
    const { name, enterprise_type, contact_person, phone } = req.body;

    // Kiểm tra xem doanh nghiệp có tồn tại không
    const existingEnterprise = await Enterprise.getById(enterpriseId);
    if (!existingEnterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp' });
    }

    // Cập nhật thông tin doanh nghiệp
    const enterpriseData = {
      name: name || existingEnterprise.name,
      enterprise_type: enterprise_type || existingEnterprise.enterprise_type,
      contact_person: contact_person || existingEnterprise.contact_person,
      phone: phone || existingEnterprise.phone
    };

    const success = await Enterprise.update(enterpriseId, enterpriseData);
    
    if (success) {
      res.status(200).json({ message: 'Cập nhật thông tin doanh nghiệp thành công' });
    } else {
      res.status(400).json({ message: 'Không thể cập nhật thông tin doanh nghiệp' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin doanh nghiệp:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thông tin doanh nghiệp' });
  }
};

// Xóa doanh nghiệp
exports.deleteEnterprise = async (req, res) => {
  try {
    const enterpriseId = req.params.id;

    // Kiểm tra xem doanh nghiệp có tồn tại không
    const existingEnterprise = await Enterprise.getById(enterpriseId);
    if (!existingEnterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp' });
    }

    const success = await Enterprise.delete(enterpriseId);
    
    if (success) {
      res.status(200).json({ message: 'Xóa doanh nghiệp thành công' });
    } else {
      res.status(400).json({ message: 'Không thể xóa doanh nghiệp' });
    }
  } catch (error) {
    console.error('Lỗi khi xóa doanh nghiệp:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa doanh nghiệp' });
  }
};

// Lấy danh sách bài đăng của doanh nghiệp
exports.getEnterprisePosts = async (req, res) => {
  try {
    const enterpriseId = req.params.id;
    
    // Kiểm tra xem doanh nghiệp có tồn tại không
    const existingEnterprise = await Enterprise.getById(enterpriseId);
    if (!existingEnterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp' });
    }
    
    const posts = await Enterprise.getPosts(enterpriseId);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài đăng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách bài đăng' });
  }
};

// Tạo bài đăng mới
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc' });
    }
    
    // Lấy thông tin doanh nghiệp từ user hiện tại
    const userId = req.user.user_id;
    const enterprise = await Enterprise.getByUserId(userId);
    
    if (!enterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp liên kết với tài khoản này' });
    }
    
    // Tạo bài đăng mới với status pending
    const postData = {
      enterprise_id: enterprise.enterprise_id,
      title,
      content
    };
    
    const postId = await Enterprise.createPost(postData);
    
    res.status(201).json({
      message: 'Tạo bài đăng thành công và đang chờ duyệt',
      post_id: postId,
      status: 'pending'
    });
  } catch (error) {
    console.error('Lỗi khi tạo bài đăng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo bài đăng' });
  }
};

// Cập nhật bài đăng (chỉ cho enterprise hiện tại)
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc' });
    }
    
    // Lấy thông tin doanh nghiệp từ user hiện tại
    const userId = req.user.user_id;
    const enterprise = await Enterprise.getByUserId(userId);
    
    if (!enterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp liên kết với tài khoản này' });
    }
    
    // Kiểm tra xem bài đăng có tồn tại không và thuộc về doanh nghiệp không
    const existingPost = await Enterprise.getPostById(enterprise.enterprise_id, postId);
    if (!existingPost) {
      return res.status(404).json({ message: 'Không tìm thấy bài đăng' });
    }
    
    // Cập nhật bài đăng
    const postData = { title, content };
    const success = await Enterprise.updatePost(enterprise.enterprise_id, postId, postData);
    
    if (success) {
      res.status(200).json({ message: 'Cập nhật bài đăng thành công' });
    } else {
      res.status(400).json({ message: 'Không thể cập nhật bài đăng' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật bài đăng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật bài đăng' });
  }
};

// Xóa bài đăng (chỉ cho enterprise hiện tại)
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Lấy thông tin doanh nghiệp từ user hiện tại
    const userId = req.user.user_id;
    const enterprise = await Enterprise.getByUserId(userId);
    
    if (!enterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp liên kết với tài khoản này' });
    }
    
    // Kiểm tra xem bài đăng có tồn tại không và thuộc về doanh nghiệp không
    const existingPost = await Enterprise.getPostById(enterprise.enterprise_id, postId);
    if (!existingPost) {
      return res.status(404).json({ message: 'Không tìm thấy bài đăng' });
    }
    
    const success = await Enterprise.deletePost(enterprise.enterprise_id, postId);
    
    if (success) {
      res.status(200).json({ message: 'Xóa bài đăng thành công' });
    } else {
      res.status(400).json({ message: 'Không thể xóa bài đăng' });
    }
  } catch (error) {
    console.error('Lỗi khi xóa bài đăng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa bài đăng' });
  }
};

// Lấy danh sách đặt chỗ của doanh nghiệp
exports.getEnterpriseBookings = async (req, res) => {
  try {
    const enterpriseId = req.params.id;
    
    // Kiểm tra xem doanh nghiệp có tồn tại không
    const existingEnterprise = await Enterprise.getById(enterpriseId);
    if (!existingEnterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp' });
    }
    
    const bookings = await Enterprise.getBookings(enterpriseId);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đặt chỗ' });
  }
};

// Cập nhật trạng thái đặt chỗ
exports.updateBookingStatus = async (req, res) => {
  try {
    const enterpriseId = req.params.id;
    const bookingId = req.params.bookingId;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Trạng thái là bắt buộc' });
    }
    
    // Kiểm tra xem đặt chỗ có tồn tại không và thuộc về doanh nghiệp không
    // Giả định có phương thức getBookingById trong model Enterprise
    const existingBooking = await Enterprise.getBookingById(enterpriseId, bookingId);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }
    
    // Giả định có phương thức updateBookingStatus trong model Enterprise
    const success = await Enterprise.updateBookingStatus(bookingId, status);
    
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

// Lấy danh sách bài đăng của doanh nghiệp hiện tại
exports.getMyPosts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không có thông tin user' });
    }
    
    const userId = req.user.user_id;
    console.log('🔍 User ID requesting posts:', userId);
    
    const enterprise = await Enterprise.getByUserId(userId);
    console.log('🔍 Found enterprise:', enterprise ? enterprise.enterprise_id : 'null');
    
    if (!enterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp liên kết với tài khoản này' });
    }
    
    const posts = await Enterprise.getPosts(enterprise.enterprise_id);
    console.log('📊 Posts returned from DB:', posts.length);
    console.log('📝 Posts data:', posts);
    
    res.status(200).json(posts);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài đăng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách bài đăng' });
  }
};

// Lấy profile doanh nghiệp hiện tại
exports.getMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không có thông tin user' });
    }
    
    const userId = req.user.user_id;
    const profile = await Enterprise.getProfileByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin doanh nghiệp' });
    }
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('Lỗi khi lấy profile doanh nghiệp:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin doanh nghiệp' });
  }
};

// Cập nhật profile doanh nghiệp hiện tại
exports.updateMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không có thông tin user' });
    }
    
    const userId = req.user.user_id;
    const enterprise = await Enterprise.getByUserId(userId);
    
    if (!enterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp liên kết với tài khoản này' });
    }
    
    const { 
      name, 
      enterprise_type, 
      contact_person, 
      phone, 
      email,
      description, 
      address, 
      website, 
      opening_hours, 
      capacity, 
      facilities 
    } = req.body;
    
    // Cập nhật thông tin doanh nghiệp
    const updateData = {
      name: name || enterprise.name,
      enterprise_type: enterprise_type || enterprise.enterprise_type,
      contact_person: contact_person || enterprise.contact_person,
      phone: phone || enterprise.phone,
      description,
      address,
      website,
      opening_hours,
      capacity,
      facilities
    };
    
    const success = await Enterprise.update(enterprise.enterprise_id, updateData);
    
    // Cập nhật email trong bảng users nếu có
    if (email && success) {
      try {
        await db.query('UPDATE USERS SET email = ? WHERE user_id = ?', [email, userId]);
      } catch (emailError) {
        console.error('Lỗi khi cập nhật email:', emailError);
        return res.status(400).json({ message: 'Cập nhật thông tin doanh nghiệp thành công nhưng không thể cập nhật email' });
      }
    }
    
    if (success) {
      res.status(200).json({ message: 'Cập nhật thông tin doanh nghiệp thành công' });
    } else {
      res.status(400).json({ message: 'Không thể cập nhật thông tin doanh nghiệp' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật profile doanh nghiệp:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thông tin doanh nghiệp' });
  }
};

// Lấy danh sách đặt chỗ của doanh nghiệp hiện tại
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không có thông tin user' });
    }
    
    const userId = req.user.user_id;
    const { status } = req.query;
    
    const enterprise = await Enterprise.getByUserId(userId);
    if (!enterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp liên kết với tài khoản này' });
    }
    
    const bookings = await Enterprise.getBookings(enterprise.enterprise_id, status);
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt chỗ:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách đặt chỗ' });
  }
};

// Cập nhật trạng thái đặt chỗ của doanh nghiệp hiện tại
exports.updateMyBookingStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Không có thông tin user' });
    }
    
    const userId = req.user.user_id;
    const { bookingId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    
    const enterprise = await Enterprise.getByUserId(userId);
    if (!enterprise) {
      return res.status(404).json({ message: 'Không tìm thấy doanh nghiệp liên kết với tài khoản này' });
    }
    
    // Kiểm tra booking có tồn tại không
    const booking = await Enterprise.getBookingById(enterprise.enterprise_id, bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ' });
    }
    
    // Cập nhật trạng thái
    const success = await Enterprise.updateBookingStatus(enterprise.enterprise_id, bookingId, status);
    
    if (success) {
      // Nếu booking được confirmed, gửi email thông báo cho các thành viên đã xác nhận tham gia
      if (status === 'confirmed') {
        try {
          // Lấy thông tin chi tiết về booking và event
          const [bookingDetails] = await db.query(`
            SELECT 
              b.*,
              e.event_id,
              e.name as event_name,
              e.start_time,
              e.venue,
              g.group_id,
              g.name as group_name,
              ent.name as enterprise_name,
              ent.address as enterprise_address
            FROM BOOKINGS b
            JOIN EVENTS e ON b.event_id = e.event_id
            JOIN \`GROUPS\` g ON e.group_id = g.group_id
            JOIN ENTERPRISES ent ON b.enterprise_id = ent.enterprise_id
            WHERE b.booking_id = ? AND b.enterprise_id = ?
          `, [bookingId, enterprise.enterprise_id]);

          if (bookingDetails.length > 0) {
            const booking = bookingDetails[0];
            
            // Lấy danh sách email của các thành viên đã xác nhận tham gia event
            // Sử dụng cột participants trong bảng events (JSON array)
            const [eventParticipants] = await db.query(`
              SELECT participants FROM EVENTS WHERE event_id = ?
            `, [booking.event_id]);
            
            let participants = [];
            if (eventParticipants.length > 0 && eventParticipants[0].participants) {
              try {
                const participantIds = typeof eventParticipants[0].participants === 'string' 
                  ? JSON.parse(eventParticipants[0].participants)
                  : eventParticipants[0].participants;
                
                if (participantIds && participantIds.length > 0) {
                  // Lấy thông tin email của các participants
                  const placeholders = participantIds.map(() => '?').join(',');
                  const [participantUsers] = await db.query(`
                    SELECT DISTINCT email, full_name
                    FROM USERS 
                    WHERE user_id IN (${placeholders}) AND email IS NOT NULL AND email != ''
                  `, participantIds);
                  
                  participants = participantUsers;
                }
              } catch (parseError) {
                console.error('❌ Error parsing participants JSON:', parseError);
              }
            }

            if (participants.length > 0) {
              const participantEmails = participants.map(p => p.email);
              
              const eventData = {
                event_id: booking.event_id,
                name: booking.event_name,
                start_time: booking.start_time,
                location: booking.venue
              };
              
              const groupData = {
                group_id: booking.group_id,
                name: booking.group_name
              };
              
              const enterpriseData = {
                name: booking.enterprise_name,
                address: booking.enterprise_address
              };
              
              const bookingData = {
                booking_time: booking.booking_time,
                number_of_people: booking.number_of_people,
                notes: booking.notes
              };

              // Gửi email thông báo
              const emailResult = await sendBookingApprovedNotification(
                eventData,
                groupData,
                enterpriseData,
                bookingData,
                participantEmails
              );
              
              console.log(`✅ Sent booking approved notification to ${participantEmails.length} participants`);
            }
          }
        } catch (emailError) {
          console.error('❌ Failed to send booking approved notification:', emailError);
          // Không fail request vì đã update status thành công
        }
      }
      
      res.status(200).json({ message: 'Cập nhật trạng thái thành công' });
    } else {
      res.status(500).json({ message: 'Không thể cập nhật trạng thái' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đặt chỗ:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 