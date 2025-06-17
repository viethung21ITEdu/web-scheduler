const db = require('./utils/db');
const bcrypt = require('bcrypt');

async function createTestEnterprise() {
  try {
    console.log('🧪 Tạo doanh nghiệp test...');
    
    // Tạo user test cho doanh nghiệp
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const [userResult] = await db.query(`
      INSERT INTO USERS (username, email, password, full_name, phone, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'cafe_test',
      'cafe.test@example.com', 
      hashedPassword,
      'Cafe Test ABC',
      '0123456789',
      'Enterprise',
      'active'
    ]);
    
    const userId = userResult.insertId;
    console.log(`✅ Tạo user thành công với ID: ${userId}`);
    
    // Tạo enterprise với status inactive (chờ duyệt)
    const [enterpriseResult] = await db.query(`
      INSERT INTO ENTERPRISES (user_id, name, enterprise_type, contact_person, phone, address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      'Cafe Test ABC',
      'cafe',
      'Nguyễn Văn A',
      '0123456789',
      '123 Đường Test, Quận 1, TP.HCM',
      'inactive'
    ]);
    
    console.log(`✅ Tạo doanh nghiệp test thành công với ID: ${enterpriseResult.insertId}`);
    console.log('📋 Thông tin đăng nhập:');
    console.log('   Username: cafe_test');
    console.log('   Password: 123456');
    console.log('   Status: inactive (chờ duyệt)');
    
    console.log('🎉 Hoàn thành!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

createTestEnterprise(); 