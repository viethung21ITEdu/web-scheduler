const User = require('../models/userModel');
const Enterprise = require('../models/enterpriseModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../utils/db');
const { sendPasswordResetEmail, sendEmailVerification } = require('../services/emailService');
const { validateUserInput, sanitizeInput } = require('../utils/validation');

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, phone, role, enterprise_type } = req.body;

    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.getByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await User.getByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email này đã được sử dụng cho tài khoản khác' });
    }

    // Kiểm tra xác thực email (nếu có email)
    if (email && email.trim()) {
      if (!global.emailVerificationTokens || !global.emailVerificationTokens.has(email)) {
        return res.status(400).json({ 
          message: 'Email chưa được xác thực. Vui lòng xác thực email trước khi đăng ký.',
          requireEmailVerification: true
        });
      }

      const verificationData = global.emailVerificationTokens.get(email);
      
      // Kiểm tra token hết hạn
      if (Date.now() > verificationData.expires) {
        global.emailVerificationTokens.delete(email);
        return res.status(400).json({ 
          message: 'Mã xác thực email đã hết hạn. Vui lòng yêu cầu mã mới.',
          requireEmailVerification: true
        });
      }

      // Verify JWT token để đảm bảo tính toàn vẹn
      try {
        const decoded = jwt.verify(verificationData.token, config.jwtSecret);
        if (decoded.purpose !== 'email_verification' || decoded.email !== email) {
          global.emailVerificationTokens.delete(email);
          return res.status(400).json({ 
            message: 'Xác thực email không hợp lệ. Vui lòng thực hiện lại.',
            requireEmailVerification: true
          });
        }
      } catch (error) {
        global.emailVerificationTokens.delete(email);
        return res.status(400).json({ 
          message: 'Xác thực email không hợp lệ. Vui lòng thực hiện lại.',
          requireEmailVerification: true
        });
      }
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Tạo người dùng mới với status 'active' khi tự đăng ký
    const userData = {
      username,
      email,
      password: hashedPassword,
      full_name,
      phone,
      role: role || 'Member',
      status: 'active' // Tự động kích hoạt khi người dùng tự đăng ký
    };

    const userId = await User.create(userData);
    
    // Xóa token xác thực email sau khi tạo tài khoản thành công
    if (email && email.trim() && global.emailVerificationTokens && global.emailVerificationTokens.has(email)) {
      global.emailVerificationTokens.delete(email);
    }
    
    // Nếu là Enterprise, tạo record trong bảng ENTERPRISES
    if (role === 'Enterprise' && enterprise_type) {
      const enterpriseData = {
        user_id: userId,
        name: full_name,
        enterprise_type: enterprise_type,
        contact_person: full_name,
        phone: phone || '0000000000',
        address: 'Chưa cập nhật địa chỉ'
      };
      
      await Enterprise.create(enterpriseData);
    }
    
    res.status(201).json({
      message: 'Đăng ký thành công',
      user_id: userId
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra xem người dùng có tồn tại không (tìm theo username hoặc email)
    let user = await User.getByUsername(username);
    
    // Nếu không tìm thấy theo username, thử tìm theo email
    if (!user) {
      user = await User.getByEmail(username);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập/Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Tên đăng nhập/Email hoặc mật khẩu không đúng' });
    }

    // Tự động kích hoạt tài khoản nếu đang ở trạng thái 'pending'
    if (user.status === 'pending') {
      await User.update(user.user_id, { 
        ...user, 
        status: 'active' 
      });
      user.status = 'active';
      console.log(`Tài khoản ${username} đã được tự động kích hoạt.`);
    }

    // Kiểm tra trạng thái tài khoản user
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Tài khoản của bạn chưa được kích hoạt' });
    }

    // Nếu là doanh nghiệp, kiểm tra thêm status trong bảng ENTERPRISES
    if (user.role === 'Enterprise') {
      const enterprise = await Enterprise.getByUserId(user.user_id);
      if (!enterprise) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin doanh nghiệp' });
      }

      // Kiểm tra trạng thái doanh nghiệp
      if (enterprise.status === 'inactive') {
        return res.status(403).json({ 
          message: 'Tài khoản doanh nghiệp của bạn đang chờ duyệt. Quá trình này có thể mất 1 ngày làm việc và bạn có thể nhận được phản hồi từ quản trị viên.  Vui lòng thử lại sau.',
          status: 'pending_approval'
        });
      }

      if (enterprise.status !== 'active') {
        return res.status(403).json({ 
          message: 'Tài khoản doanh nghiệp của bạn chưa được kích hoạt. Vui lòng liên hệ quản trị viên.',
          status: 'not_approved'
        });
      }
    }

    // Tạo token JWT
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        username: user.username,
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách người dùng' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.getById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Loại bỏ thông tin mật khẩu trước khi trả về
    delete user.password;
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, full_name, phone, role, status } = req.body;

    // Kiểm tra xem người dùng có tồn tại không
    const existingUser = await User.getById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật thông tin người dùng
    const userData = {
      username: username || existingUser.username,
      email: email || existingUser.email,
      full_name: full_name || existingUser.full_name,
      phone: phone || existingUser.phone,
      role: role || existingUser.role,
      status: status || existingUser.status
    };

    const success = await User.update(userId, userData);
    
    if (success) {
      res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công' });
    } else {
      res.status(400).json({ message: 'Không thể cập nhật thông tin người dùng' });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thông tin người dùng' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra xem người dùng có tồn tại không
    const existingUser = await User.getById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const success = await User.delete(userId);
    
    if (success) {
      res.status(200).json({ message: 'Xóa người dùng thành công' });
    } else {
      res.status(400).json({ message: 'Không thể xóa người dùng' });
    }
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa người dùng' });
  }
};

// API để lấy profile của user hiện tại
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy từ middleware auth
    const user = await User.getById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy thông tin người dùng' 
      });
    }
    
    // Loại bỏ thông tin mật khẩu
    delete user.password;
    
    res.status(200).json({
      success: true,
      data: {
        name: user.full_name,
        phone: user.phone,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi lấy thông tin profile' 
    });
  }
};

// API để cập nhật profile của user hiện tại
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy từ middleware auth
    const { name, phone, email } = req.body;

    // Validate input
    if (!name || !phone || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tên, số điện thoại và email không được để trống' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email không đúng định dạng' 
      });
    }

    // Validate phone format (10-11 số)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Số điện thoại phải có 10-11 chữ số' 
      });
    }

    // Kiểm tra email đã tồn tại chưa (trừ user hiện tại)
    const existingUser = await User.getByEmail(email);
    if (existingUser && existingUser.user_id !== userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email này đã được sử dụng bởi tài khoản khác' 
      });
    }

    // Lấy thông tin user hiện tại
    const currentUser = await User.getById(userId);
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy thông tin người dùng' 
      });
    }

    // Cập nhật profile
    const userData = {
      ...currentUser,
      full_name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase()
    };

    const success = await User.update(userId, userData);
    
    if (success) {
      res.status(200).json({ 
        success: true, 
        message: 'Cập nhật thông tin thành công' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Không thể cập nhật thông tin' 
      });
    }
  } catch (error) {
    console.error('Lỗi khi cập nhật profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi cập nhật thông tin' 
    });
  }
};

exports.batchAddUsers = async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ' });
    }
    
    const results = [];
    const errors = [];
    
    // Xử lý từng người dùng
    for (const userData of users) {
      try {
        // Kiểm tra dữ liệu bắt buộc
        if (!userData.username || !userData.email || !userData.password) {
          errors.push({ user: userData.email, error: 'Thiếu thông tin bắt buộc' });
          continue;
        }
        
        // Kiểm tra xem username hoặc email đã tồn tại chưa
        const existingUser = await User.getByUsername(userData.username);
        if (existingUser) {
          errors.push({ user: userData.email, error: 'Tên đăng nhập đã tồn tại' });
          continue;
        }
        
        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
        
        // Tạo người dùng mới với trạng thái 'pending'
        const newUserData = {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          full_name: userData.full_name || userData.username,
          phone: userData.phone || null,
          role: userData.role || 'Member',
          status: 'pending' // Mặc định là 'pending' khi admin tạo
        };
        
        const userId = await User.create(newUserData);
        results.push({ email: userData.email, user_id: userId });
        
      } catch (error) {
        console.error(`Lỗi khi tạo người dùng ${userData.email}:`, error);
        errors.push({ user: userData.email, error: error.message });
      }
    }
    
    res.status(201).json({
      message: `Đã thêm ${results.length} người dùng, ${errors.length} lỗi`,
      results,
      errors
    });
  } catch (error) {
    console.error('Lỗi khi thêm hàng loạt người dùng:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm người dùng' });
  }
};

// Lấy thống kê của user (số nhóm, sự kiện, đánh giá)
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Lấy số nhóm tham gia
    const [groupCount] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM memberships m 
      WHERE m.user_id = ?
    `, [userId]);
    
    // Lấy số sự kiện đã tham gia (dựa trên participants trong events)
    const [eventParticipations] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM events e
      WHERE JSON_CONTAINS(e.participants, ?, '$')
    `, [JSON.stringify(userId)]);
    
    // Lấy hoạt động gần đây (các nhóm đã tham gia và events gần đây)
    const [recentActivities] = await db.execute(`
      SELECT 
        'group_join' as activity_type,
        g.name as activity_name,
        m.joined_at as activity_date
      FROM memberships m
      JOIN \`GROUPS\` g ON m.group_id = g.group_id
      WHERE m.user_id = ?
      
      UNION ALL
      
      SELECT 
        'event_participation' as activity_type,
        e.name as activity_name,
        e.start_time as activity_date
      FROM events e
      WHERE JSON_CONTAINS(e.participants, ?, '$') AND e.start_time IS NOT NULL
      
      ORDER BY activity_date DESC
      LIMIT 3
    `, [userId, JSON.stringify(userId)]);
    
    res.status(200).json({
      success: true,
      data: {
        groupCount: groupCount[0].count,
        eventCount: eventParticipations[0].count,
        recentActivities: recentActivities.map(activity => ({
          type: activity.activity_type,
          name: activity.activity_name,
          date: activity.activity_date,
          displayText: activity.activity_type === 'group_join' 
            ? `Tham gia nhóm "${activity.activity_name}"`
            : `Tham gia sự kiện "${activity.activity_name}"`
        }))
      },
      message: 'Lấy thống kê user thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thống kê user' 
    });
  }
};

// Quên mật khẩu - gửi email reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email là bắt buộc' });
    }

    // Kiểm tra email có tồn tại không
    const [users] = await db.query('SELECT * FROM USERS WHERE email = ?', [email]);
    
    if (users.length === 0) {
      // Để bảo mật, vẫn trả về success để không để lộ email nào tồn tại
      return res.status(200).json({ 
        message: 'Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được email chứa mã khôi phục mật khẩu.' 
      });
    }

    const user = users[0];

    // Tạo mã khôi phục 6 chữ số
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Tạo JWT token chứa mã khôi phục (hết hạn sau 15 phút)
    const resetToken = jwt.sign(
      { 
        user_id: user.user_id,
        email: user.email,
        reset_code: resetCode,
        purpose: 'reset_password'
      },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    // Lưu token vào session hoặc có thể lưu vào database tạm thời
    // Ở đây tôi sẽ lưu vào memory cache đơn giản (production nên dùng Redis)
    if (!global.resetTokens) {
      global.resetTokens = new Map();
    }
    global.resetTokens.set(user.email, {
      token: resetToken,
      code: resetCode,
      expires: Date.now() + 15 * 60 * 1000 // 15 phút
    });

    // Gửi email với mã khôi phục
    const emailResult = await sendPasswordResetEmail(user, resetCode);

    if (emailResult.success) {
      res.status(200).json({ 
        message: 'Mã khôi phục đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã để đặt lại mật khẩu.' 
      });
    } else {
      res.status(500).json({ 
        message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.' 
      });
    }

  } catch (error) {
    console.error('Lỗi quên mật khẩu:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý yêu cầu' });
  }
};

// Reset mật khẩu với mã khôi phục
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Email, mã khôi phục và mật khẩu mới là bắt buộc' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Kiểm tra mã khôi phục từ memory cache
    if (!global.resetTokens || !global.resetTokens.has(email)) {
      return res.status(400).json({ message: 'Mã khôi phục không hợp lệ hoặc đã hết hạn.' });
    }

    const resetData = global.resetTokens.get(email);
    
    // Kiểm tra hết hạn
    if (Date.now() > resetData.expires) {
      global.resetTokens.delete(email);
      return res.status(400).json({ message: 'Mã khôi phục đã hết hạn. Vui lòng yêu cầu mã mới.' });
    }

    // Kiểm tra mã khôi phục
    if (resetData.code !== resetCode) {
      return res.status(400).json({ message: 'Mã khôi phục không chính xác.' });
    }

    // Verify JWT token để đảm bảo tính toàn vẹn
    let decoded;
    try {
      decoded = jwt.verify(resetData.token, config.jwtSecret);
    } catch (error) {
      global.resetTokens.delete(email);
      return res.status(400).json({ message: 'Mã khôi phục không hợp lệ.' });
    }

    // Kiểm tra purpose và email
    if (decoded.purpose !== 'reset_password' || decoded.email !== email) {
      global.resetTokens.delete(email);
      return res.status(400).json({ message: 'Mã khôi phục không hợp lệ.' });
    }

    // Kiểm tra user có tồn tại không
    const [users] = await db.query('SELECT * FROM USERS WHERE user_id = ? AND email = ?', [decoded.user_id, decoded.email]);
    
    if (users.length === 0) {
      global.resetTokens.delete(email);
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Cập nhật mật khẩu
    await db.query('UPDATE USERS SET password = ? WHERE user_id = ?', [hashedPassword, decoded.user_id]);

    // Xóa mã khôi phục đã sử dụng
    global.resetTokens.delete(email);

    res.status(200).json({ 
      message: 'Mật khẩu đã được thay đổi thành công. Bạn có thể đăng nhập với mật khẩu mới.' 
    });

  } catch (error) {
    console.error('Lỗi reset mật khẩu:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đặt lại mật khẩu' });
  }
};

// Gửi mã xác thực email cho đăng ký
exports.sendEmailVerification = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: 'Email và username là bắt buộc' });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existingUsers] = await db.query('SELECT * FROM USERS WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email này đã được sử dụng cho tài khoản khác' });
    }

    // Tạo mã xác thực 6 chữ số
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Tạo JWT token chứa mã xác thực (hết hạn sau 15 phút)
    const verificationToken = jwt.sign(
      { 
        email: email,
        username: username,
        verification_code: verificationCode,
        purpose: 'email_verification'
      },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    // Lưu token vào memory cache (production nên dùng Redis)
    if (!global.emailVerificationTokens) {
      global.emailVerificationTokens = new Map();
    }
    global.emailVerificationTokens.set(email, {
      token: verificationToken,
      code: verificationCode,
      username: username,
      expires: Date.now() + 15 * 60 * 1000 // 15 phút
    });

    // Gửi email với mã xác thực
    const userData = { email, username };
    const emailResult = await sendEmailVerification(userData, verificationCode);

    if (emailResult.success) {
      res.status(200).json({ 
        message: 'Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã để hoàn tất đăng ký.',
        email: email
      });
    } else {
      res.status(500).json({ 
        message: 'Có lỗi xảy ra khi gửi email xác thực. Vui lòng thử lại sau.' 
      });
    }

  } catch (error) {
    console.error('Lỗi gửi mã xác thực email:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi gửi mã xác thực' });
  }
};

// Xác thực mã email verification
exports.verifyEmailCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ message: 'Email và mã xác thực là bắt buộc' });
    }

    // Kiểm tra mã xác thực từ memory cache
    if (!global.emailVerificationTokens || !global.emailVerificationTokens.has(email)) {
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' });
    }

    const verificationData = global.emailVerificationTokens.get(email);
    
    // Kiểm tra hết hạn
    if (Date.now() > verificationData.expires) {
      global.emailVerificationTokens.delete(email);
      return res.status(400).json({ message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.' });
    }

    // Kiểm tra mã xác thực
    if (verificationData.code !== verificationCode) {
      return res.status(400).json({ message: 'Mã xác thực không chính xác.' });
    }

    // Verify JWT token để đảm bảo tính toàn vẹn
    let decoded;
    try {
      decoded = jwt.verify(verificationData.token, config.jwtSecret);
    } catch (error) {
      global.emailVerificationTokens.delete(email);
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ.' });
    }

    // Kiểm tra purpose và email
    if (decoded.purpose !== 'email_verification' || decoded.email !== email) {
      global.emailVerificationTokens.delete(email);
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ.' });
    }

    // Kiểm tra email vẫn chưa được sử dụng
    const [existingUsers] = await db.query('SELECT * FROM USERS WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      global.emailVerificationTokens.delete(email);
      return res.status(400).json({ message: 'Email này đã được sử dụng cho tài khoản khác.' });
    }

    // Trả về thông tin để frontend có thể tiếp tục tạo tài khoản
    res.status(200).json({ 
      message: 'Email đã được xác thực thành công. Bạn có thể tiếp tục hoàn tất đăng ký.',
      verified: true,
      email: email,
      username: decoded.username
    });

    // Không xóa token ngay, để có thể sử dụng trong quá trình tạo tài khoản
    // Token sẽ được xóa khi tạo tài khoản thành công hoặc hết hạn

  } catch (error) {
    console.error('Lỗi xác thực email:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xác thực email' });
  }
};

// Gửi lại mã xác thực email
exports.resendEmailVerification = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: 'Email và username là bắt buộc' });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existingUsers] = await db.query('SELECT * FROM USERS WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email này đã được sử dụng cho tài khoản khác' });
    }

    // Xóa token cũ nếu có
    if (global.emailVerificationTokens && global.emailVerificationTokens.has(email)) {
      global.emailVerificationTokens.delete(email);
    }

    // Tạo mã xác thực mới
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Tạo JWT token mới
    const verificationToken = jwt.sign(
      { 
        email: email,
        username: username,
        verification_code: verificationCode,
        purpose: 'email_verification'
      },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    // Lưu token mới vào memory cache
    if (!global.emailVerificationTokens) {
      global.emailVerificationTokens = new Map();
    }
    global.emailVerificationTokens.set(email, {
      token: verificationToken,
      code: verificationCode,
      username: username,
      expires: Date.now() + 15 * 60 * 1000 // 15 phút
    });

    // Gửi email với mã xác thực mới
    const userData = { email, username };
    const emailResult = await sendEmailVerification(userData, verificationCode);

    if (emailResult.success) {
      res.status(200).json({ 
        message: 'Mã xác thực mới đã được gửi đến email của bạn.',
        email: email
      });
    } else {
      res.status(500).json({ 
        message: 'Có lỗi xảy ra khi gửi email xác thực. Vui lòng thử lại sau.' 
      });
    }

  } catch (error) {
    console.error('Lỗi gửi lại mã xác thực:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi gửi lại mã xác thực' });
  }
}; 