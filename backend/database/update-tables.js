const mysql = require('mysql2/promise');
const config = require('../config');

async function updateTables() {
  console.log('Đang kiểm tra và cập nhật cấu trúc bảng...');

  // Tạo kết nối đến MySQL
  const connection = await mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port,
    multipleStatements: true // Cho phép thực thi nhiều câu lệnh SQL cùng lúc
  });

  try {
    // Kiểm tra và cập nhật bảng GROUPS
    console.log('Đang kiểm tra bảng GROUPS...');
    
    // Kiểm tra cột status
    await connection.query(`
      ALTER TABLE \`GROUPS\` 
      MODIFY COLUMN status ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
    `);
    
    // Kiểm tra cột created_at
    const [createdAtColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${config.db.database}' 
      AND TABLE_NAME = 'GROUPS' 
      AND COLUMN_NAME = 'created_at'
    `);
    
    if (createdAtColumns.length === 0) {
      await connection.query(`
        ALTER TABLE \`GROUPS\` 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
    }
    
    // Kiểm tra cột updated_at
    const [updatedAtColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${config.db.database}' 
      AND TABLE_NAME = 'GROUPS' 
      AND COLUMN_NAME = 'updated_at'
    `);
    
    if (updatedAtColumns.length === 0) {
      await connection.query(`
        ALTER TABLE \`GROUPS\` 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    }
    
    console.log('Bảng GROUPS đã được cập nhật.');

    // Kiểm tra và cập nhật bảng MEMBERSHIPS
    console.log('Đang kiểm tra bảng MEMBERSHIPS...');
    
    // Cập nhật cột role_in_group
    await connection.query(`
      ALTER TABLE MEMBERSHIPS 
      MODIFY COLUMN role_in_group ENUM('Leader', 'Member') NOT NULL DEFAULT 'Member'
    `);
    
    // Kiểm tra cột joined_at
    const [joinedAtColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${config.db.database}' 
      AND TABLE_NAME = 'MEMBERSHIPS' 
      AND COLUMN_NAME = 'joined_at'
    `);
    
    if (joinedAtColumns.length === 0) {
      await connection.query(`
        ALTER TABLE MEMBERSHIPS 
        ADD COLUMN joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
    }
    
    // Thêm unique key nếu chưa tồn tại
    const [uniqueKeys] = await connection.query(`
      SHOW KEYS FROM MEMBERSHIPS WHERE Key_name = 'unique_membership'
    `);
    
    if (uniqueKeys.length === 0) {
      await connection.query(`
        ALTER TABLE MEMBERSHIPS 
        ADD UNIQUE KEY unique_membership (user_id, group_id)
      `);
    }
    
    console.log('Bảng MEMBERSHIPS đã được cập nhật.');

    // Kiểm tra và cập nhật các ràng buộc khóa ngoại
    console.log('Đang kiểm tra ràng buộc khóa ngoại...');
    
    // Lấy danh sách các ràng buộc khóa ngoại hiện có
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
      FROM information_schema.REFERENTIAL_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = '${config.db.database}'
    `);
    
    // Kiểm tra và thêm ràng buộc khóa ngoại cho bảng MEMBERSHIPS nếu chưa có
    const membershipConstraints = constraints.filter(c => c.TABLE_NAME === 'MEMBERSHIPS');
    
    if (!membershipConstraints.some(c => c.REFERENCED_TABLE_NAME === 'USERS')) {
      console.log('Thêm ràng buộc khóa ngoại từ MEMBERSHIPS đến USERS...');
      await connection.query(`
        ALTER TABLE MEMBERSHIPS
        ADD CONSTRAINT fk_membership_user
        FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
      `);
    }
    
    if (!membershipConstraints.some(c => c.REFERENCED_TABLE_NAME === 'GROUPS')) {
      console.log('Thêm ràng buộc khóa ngoại từ MEMBERSHIPS đến GROUPS...');
      await connection.query(`
        ALTER TABLE MEMBERSHIPS
        ADD CONSTRAINT fk_membership_group
        FOREIGN KEY (group_id) REFERENCES \`GROUPS\`(group_id) ON DELETE CASCADE
      `);
    }

    console.log('Cập nhật cấu trúc bảng hoàn tất.');
  } catch (error) {
    console.error('Lỗi khi cập nhật cấu trúc bảng:', error);
  } finally {
    await connection.end();
  }
}

// Thực thi hàm cập nhật bảng
updateTables().catch(console.error); 