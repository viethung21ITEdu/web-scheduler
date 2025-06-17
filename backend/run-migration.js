const db = require('./utils/db');

async function runMigration() {
  try {
    console.log('🔄 Chạy migration...');
    
    // Cập nhật định nghĩa bảng ENTERPRISES với chỉ 2 trạng thái
    await db.query(`
      ALTER TABLE ENTERPRISES 
      MODIFY COLUMN status ENUM('active', 'inactive') DEFAULT 'inactive'
      COMMENT 'Status: inactive=chờ duyệt, active=đã duyệt'
    `);
    console.log('✅ Cập nhật định nghĩa status ENTERPRISES thành công');
    
    // Cập nhật enterprise_type enum theo yêu cầu mới
    await db.query(`
      ALTER TABLE ENTERPRISES 
      MODIFY COLUMN enterprise_type ENUM('cafe', 'restaurant', 'library', 'cinema', 'other') NOT NULL
    `);
    console.log('✅ Cập nhật định nghĩa enterprise_type thành công');
    
    // Cập nhật các doanh nghiệp hiện có thành 'inactive' để admin có thể duyệt
    const [result] = await db.query(`
      UPDATE ENTERPRISES 
      SET status = 'inactive' 
      WHERE status = 'active' OR status = 'pending'
    `);
    console.log(`✅ Cập nhật ${result.affectedRows} doanh nghiệp thành trạng thái chờ duyệt`);
    
    // Cập nhật enterprise_type hiện có để phù hợp với enum mới
    const [typeResult] = await db.query(`
      UPDATE ENTERPRISES 
      SET enterprise_type = 'other' 
      WHERE enterprise_type IN ('mall', 'hotel')
    `);
    console.log(`✅ Cập nhật ${typeResult.affectedRows} loại doanh nghiệp không còn hỗ trợ thành 'other'`);
    
    console.log('🎉 Migration hoàn thành!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi chạy migration:', error);
    process.exit(1);
  }
}

runMigration(); 