const mysql = require('mysql2');
const config = require('./config');

// Tạo pool connection thay vì single connection để xử lý nhiều request đồng thời
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
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Kết nối database đã bị đóng');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database có quá nhiều kết nối');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Yêu cầu kết nối database bị từ chối');
    }
    console.error('Kết nối MySQL thất bại:', err);
  } else {
    console.log('Kết nối MySQL thành công!');
    connection.release();
  }
});

module.exports = promisePool;
