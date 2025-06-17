const mysql = require('mysql2');
const config = require('../config');

// Tạo pool connection để sử dụng trong toàn bộ ứng dụng
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  port: config.db.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Chuyển đổi pool thành promise để sử dụng async/await
const promisePool = pool.promise();

// Kiểm tra kết nối
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Lỗi kết nối đến database:', err);
  } else {
    console.log('Kết nối thành công đến MySQL');
    connection.release();
  }
});

// Wrapper cho các truy vấn database
module.exports = promisePool; 