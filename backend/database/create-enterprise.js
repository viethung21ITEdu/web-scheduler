const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('../config');

async function createEnterpriseAccount() {
  console.log('Đang tạo tài khoản enterprise...');

  const connection = await mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port
  });

  try {
    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash('enterprise123', 10);

    // Kiểm tra xem tài khoản enterprise đã tồn tại chưa
    const [existingUsers] = await connection.query('SELECT * FROM USERS WHERE username = ?', ['enterprise1']);

    if (existingUsers.length === 0) {
      console.log('Đang tạo tài khoản enterprise...');
      
      // Tạo user enterprise
      const [userResult] = await connection.query(
        'INSERT INTO USERS (username, email, password, full_name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['enterprise1', 'enterprise1@example.com', hashedPassword, 'Doanh nghiệp Demo', '0909090909', 'Enterprise', 'active']
      );

      const userId = userResult.insertId;
      console.log(`Tài khoản enterprise đã được tạo với ID: ${userId}`);

      // Tạo thông tin doanh nghiệp
      await connection.query(
        'INSERT INTO ENTERPRISES (user_id, name, enterprise_type, contact_person, phone) VALUES (?, ?, ?, ?, ?)',
        [userId, 'Quán Cafe Demo', 'cafe', 'Nguyễn Văn A', '0909090909']
      );

      await connection.query(
        'INSERT INTO ENTERPRISES (user_id, name, enterprise_type, contact_person, phone) VALUES (?, ?, ?, ?, ?)',
        [userId, 'Nhà hàng Demo', 'restaurant', 'Trần Thị B', '0911223344']
      );

      console.log('Thông tin doanh nghiệp đã được tạo.');

      console.log('\n=== THÔNG TIN ĐĂNG NHẬP ===');
      console.log('Username: enterprise1');
      console.log('Email: enterprise1@example.com'); 
      console.log('Password: enterprise123');
      console.log('Role: Enterprise');
      console.log('==========================\n');

    } else {
      console.log('Tài khoản enterprise đã tồn tại.');
      console.log('\n=== THÔNG TIN ĐĂNG NHẬP ===');
      console.log('Username: enterprise1');
      console.log('Email: enterprise1@example.com');
      console.log('Password: enterprise123');
      console.log('Role: Enterprise');
      console.log('==========================\n');
    }

  } catch (error) {
    console.error('Lỗi khi tạo tài khoản enterprise:', error);
  } finally {
    await connection.end();
  }
}

createEnterpriseAccount().catch(console.error); 