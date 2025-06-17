const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../utils/db');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [id]);
    if (rows.length > 0) {
      done(null, rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  passReqToCallback: true // Để có thể truy cập req.session
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Debug session info
    console.log('🔍 Google Auth Session:', {
      isLinking: req.session?.isLinking,
      linkUserId: req.session?.linkUserId,
      wasLinking: req.session?.wasLinking
    });
    
    // Kiểm tra xem đây có phải là linking request không
    const isLinking = req.session?.isLinking && req.session?.linkUserId;
    
    if (isLinking) {
      // Đây là linking request - cập nhật user hiện tại với Google info
      const linkUserId = req.session.linkUserId;
      
      console.log('🔍 Linking attempt - Google ID:', profile.id, 'Email:', profile.emails[0].value);
      
      // Kiểm tra xem user hiện tại đã có Google ID chưa
      const [currentUser] = await db.execute(
        'SELECT google_id FROM users WHERE user_id = ?', 
        [linkUserId]
      );
      
      if (currentUser.length > 0 && currentUser[0].google_id) {
        // Kiểm tra xem có phải đang link với cùng Google ID không
        if (currentUser[0].google_id === profile.id) {
          // Cùng Google ID, chỉ cần cập nhật tokens
          await db.execute(
            'UPDATE users SET google_access_token = ?, google_refresh_token = ?, google_token_expires_at = ? WHERE user_id = ?',
            [accessToken, refreshToken, new Date(Date.now() + 3600 * 1000 * 24), linkUserId]
          );
          
          const [updatedUser] = await db.execute(
            'SELECT * FROM users WHERE user_id = ?', 
            [linkUserId]
          );
          
          req.session.wasLinking = true;
          req.session.isLinking = false;
          req.session.linkUserId = null;
          
          return done(null, updatedUser[0]);
        } else {
          // Khác Google ID
          return done(new Error(`Tài khoản của bạn đã được liên kết với Google Account khác. Vui lòng hủy liên kết trước khi liên kết Google Account mới.`), null);
        }
      }
      
      // Kiểm tra xem Google ID đã được sử dụng bởi user khác không (trừ chính user hiện tại)
      const [existingGoogleIdUser] = await db.execute(
        'SELECT user_id FROM users WHERE google_id = ? AND user_id != ?', 
        [profile.id, linkUserId]
      );
      
      if (existingGoogleIdUser.length > 0) {
        // Google ID đã được sử dụng bởi user khác
        return done(new Error(`❌ Google Account này đã có tài khoản riêng!\n\n💡 Để sử dụng Google Account này:\n1️⃣ Đăng xuất khỏi tài khoản hiện tại\n2️⃣ Đăng nhập bằng "Đăng nhập với Google"\n\n🔄 Hoặc chọn Google Account khác để liên kết với tài khoản hiện tại.`), null);
      }
      
      // Kiểm tra xem Google email có bị trùng với user khác không (trừ chính user hiện tại)
      const [existingEmailUser] = await db.execute(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?', 
        [profile.emails[0].value, linkUserId]
      );
      
      if (existingEmailUser.length > 0) {
        // Email đã được sử dụng bởi user khác
        return done(new Error(`❌ Email này đã được sử dụng bởi tài khoản khác!\n\n💡 Vui lòng chọn Google Account khác để liên kết.`), null);
      }
      
      // Cập nhật Google info, email và provider
      await db.execute(
        'UPDATE users SET google_id = ?, email = ?, provider = ?, google_access_token = ?, google_refresh_token = ?, google_token_expires_at = ? WHERE user_id = ?',
        [profile.id, profile.emails[0].value, 'google', accessToken, refreshToken, new Date(Date.now() + 3600 * 1000 * 24), linkUserId]
      );
      
      // Lấy user đã được cập nhật
      const [updatedUser] = await db.execute(
        'SELECT * FROM users WHERE user_id = ?', 
        [linkUserId]
      );
      
      // Đánh dấu là linking để redirect đúng
      req.session.wasLinking = true;
      req.session.isLinking = false;
      req.session.linkUserId = null;
      
      return done(null, updatedUser[0]);
    }
    
    // Đây là đăng nhập bình thường
    // Clear any lingering session data
    req.session.isLinking = false;
    req.session.linkUserId = null;
    req.session.wasLinking = false;
    
    // Kiểm tra xem user đã tồn tại với google_id chưa
    const [existingUser] = await db.execute(
      'SELECT * FROM users WHERE google_id = ?', 
      [profile.id]
    );

    if (existingUser.length > 0) {
      // User đã tồn tại, cập nhật tokens mới và đăng nhập
      await db.execute(
        'UPDATE users SET google_access_token = ?, google_refresh_token = ?, google_token_expires_at = ? WHERE google_id = ?',
        [accessToken, refreshToken, new Date(Date.now() + 3600 * 1000 * 24), profile.id]
      );
      
      // Lấy user với tokens đã cập nhật
      const [updatedUser] = await db.execute(
        'SELECT * FROM users WHERE google_id = ?', 
        [profile.id]
      );
      
      return done(null, updatedUser[0]);
    }

    // Kiểm tra xem email đã được sử dụng chưa
    const [existingEmail] = await db.execute(
      'SELECT * FROM users WHERE email = ?', 
      [profile.emails[0].value]
    );

    if (existingEmail.length > 0) {
      // Email đã tồn tại, liên kết tài khoản Google với tokens
      await db.execute(
        'UPDATE users SET google_id = ?, provider = ?, google_access_token = ?, google_refresh_token = ?, google_token_expires_at = ? WHERE email = ?',
        [profile.id, 'google', accessToken, refreshToken, new Date(Date.now() + 3600 * 1000 * 24), profile.emails[0].value]
      );
      
      const [updatedUser] = await db.execute(
        'SELECT * FROM users WHERE email = ?', 
        [profile.emails[0].value]
      );
      
      return done(null, updatedUser[0]);
    }

    // Tạo user mới với Google tokens
    const newUser = {
      username: profile.displayName || profile.emails[0].value.split('@')[0],
      email: profile.emails[0].value,
      full_name: profile.displayName,
      google_id: profile.id,
      provider: 'google',
      role: 'Member', // Mặc định là Member
      status: 'active', // Sử dụng 'status' thay vì 'is_active'
      google_access_token: accessToken,
      google_refresh_token: refreshToken,
      google_token_expires_at: new Date(Date.now() + 3600 * 1000 * 24) // 24 hours from now
    };

    const [result] = await db.execute(
      `INSERT INTO users (username, email, full_name, google_id, provider, role, status, google_access_token, google_refresh_token, google_token_expires_at, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        newUser.username,
        newUser.email,
        newUser.full_name,
        newUser.google_id,
        newUser.provider,
        newUser.role,
        newUser.status,
        newUser.google_access_token,
        newUser.google_refresh_token,
        newUser.google_token_expires_at
      ]
    );

    // Lấy user vừa tạo
    const [createdUser] = await db.execute(
      'SELECT * FROM users WHERE user_id = ?', 
      [result.insertId]
    );

    return done(null, createdUser[0]);

  } catch (error) {
    console.error('Error in Google Strategy:', error);
    return done(error, null);
  }
}));

module.exports = passport;
