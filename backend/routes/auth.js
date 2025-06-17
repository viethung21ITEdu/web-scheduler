const express = require('express');
const passport = require('../middlewares/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Route để bắt đầu Google OAuth flow
router.get('/google', (req, res, next) => {
  // Clear any existing linking session data for normal login
  req.session.isLinking = false;
  req.session.linkUserId = null;
  req.session.wasLinking = false;
  
  // Lưu thông tin nếu đây là đăng nhập từ trang doanh nghiệp
  req.session.isEnterpriseAuth = req.query.enterprise_auth === 'true';
  
  passport.authenticate('google', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

// Route callback từ Google
router.get('/google/callback', 
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) {
        console.error('Google auth error:', err);
        // Xử lý lỗi linking (Google Account đã tồn tại, email trùng, v.v.)
        if (err.message && (
          err.message.includes('đã được sử dụng bởi tài khoản khác') || 
          err.message.includes('đã có tài khoản riêng') ||
          err.message.includes('Email này đã được sử dụng')
        )) {
          return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/link-error?message=${encodeURIComponent(err.message)}`);
        }
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed&message=${encodeURIComponent(err.message)}`);
      }
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    try {
      // Kiểm tra xem có phải là linking không
      const wasLinking = req.session?.wasLinking || false;
      const isEnterpriseAuth = req.session?.isEnterpriseAuth || false;
      
      // Tạo JWT token cho user
      const token = jwt.sign(
        { 
          user_id: req.user.user_id, 
          username: req.user.username,
          role: req.user.role,
          email: req.user.email
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Tạo response data
      const userData = {
        user_id: req.user.user_id,
        username: req.user.username,
        email: req.user.email,
        full_name: req.user.full_name,
        role: req.user.role,
        provider: req.user.provider
      };

      // Debug frontend URL
      console.log('🔍 FRONTEND_URL:', process.env.FRONTEND_URL);
      console.log('🔍 Was Linking:', wasLinking);
      console.log('🔍 Is Enterprise Auth:', isEnterpriseAuth);
      
      // Chuyển hướng về frontend với token
      if (wasLinking) {
        // Nếu là linking, chuyển về trang time editor với thông báo thành công
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/link-success?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
      } else {
        // Đăng nhập bình thường
        let redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
        
        // Nếu là enterprise auth nhưng user không phải Enterprise role
        if (isEnterpriseAuth && req.user.role !== 'Enterprise') {
          redirectUrl += `&enterprise_auth=true&non_enterprise_message=${encodeURIComponent('Bạn không phải doanh nghiệp')}`;
        }
        
        res.redirect(redirectUrl);
      }

    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect('/login?error=authentication_failed');
    }
  }
);

// Route để liên kết Google Account với tài khoản hiện tại
router.get('/google/link', (req, res, next) => {
  // Xử lý token từ query parameter hoặc header
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
      
      // Nếu có user info, lưu vào session
      req.session.linkUserId = req.user.user_id;
      req.session.isLinking = true;
      req.session.wasLinking = true;
      
      // Chuyển hướng đến Google OAuth
      passport.authenticate('google', { 
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
        accessType: 'offline',
        prompt: 'consent'
      })(req, res, next);
      
    } catch (error) {
      console.log('Token verification failed:', error.message);
      // Token không hợp lệ, chuyển về trang đăng nhập
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=invalid_token&message=${encodeURIComponent('Vui lòng đăng nhập trước khi liên kết Google Account')}`);
    }
  } else {
    // Không có token, chuyển về trang đăng nhập
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_token&message=${encodeURIComponent('Vui lòng đăng nhập trước khi liên kết Google Account')}`);
  }
});

// Route để debug session
router.get('/debug-session', (req, res) => {
  res.json({
    session: {
      isLinking: req.session?.isLinking,
      linkUserId: req.session?.linkUserId,
      wasLinking: req.session?.wasLinking
    }
  });
});

// Route để clear session
router.post('/clear-session', (req, res) => {
  req.session.isLinking = false;
  req.session.linkUserId = null;
  req.session.wasLinking = false;
  res.json({ success: true, message: 'Session cleared' });
});

// Route để logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('auth_token');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router; 