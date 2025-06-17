const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config');

async function setupDatabase() {
  console.log('Đang thiết lập database...');

  // Tạo kết nối đến MySQL
  const connection = await mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    port: config.db.port,
    multipleStatements: true // Cho phép thực thi nhiều câu lệnh SQL cùng lúc
  });

  try {
    // Tạo database nếu chưa tồn tại
    console.log(`Đang tạo database ${config.db.database}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.database}`);
    console.log(`Database ${config.db.database} đã được tạo hoặc đã tồn tại.`);

    // Sử dụng database
    console.log(`Đang sử dụng database ${config.db.database}...`);
    await connection.query(`USE ${config.db.database}`);

    // Đọc file schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Thực thi schema
    console.log('Đang thực thi schema...');
    await connection.query(schema);
    console.log('Schema đã được thực thi thành công.');

    // Tạo tài khoản admin mặc định nếu chưa tồn tại
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    console.log('Đang kiểm tra tài khoản admin...');
    const [adminUsers] = await connection.query('SELECT * FROM USERS WHERE username = ?', ['admin']);

    if (adminUsers.length === 0) {
      console.log('Đang tạo tài khoản admin mặc định...');
      await connection.query(
        'INSERT INTO USERS (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin@example.com', hashedPassword, 'Administrator', 'Admin', 'active']
      );
      console.log('Tài khoản admin đã được tạo.');
    } else {
      console.log('Tài khoản admin đã tồn tại.');
    }

    console.log('Thiết lập database hoàn tất.');
  } catch (error) {
    console.error('Lỗi khi thiết lập database:', error);
  } finally {
    await connection.end();
  }
}

// Thực thi hàm thiết lập database
setupDatabase().catch(console.error); 