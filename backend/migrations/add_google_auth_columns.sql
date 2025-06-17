-- Migration: Add Google authentication columns to users table
USE web_scheduler;

-- Thêm cột google_id để lưu Google ID
ALTER TABLE USERS ADD google_id VARCHAR(255) UNIQUE;

-- Thêm cột provider để phân biệt local/google authentication  
ALTER TABLE USERS ADD provider ENUM('local', 'google') DEFAULT 'local';

-- Thêm index cho google_id để tối ưu hóa truy vấn
ALTER TABLE USERS ADD INDEX idx_google_id (google_id);

-- Cho phép password NULL khi đăng nhập bằng Google
ALTER TABLE USERS MODIFY password VARCHAR(255) NULL;

-- Cập nhật users hiện có để có provider = 'local'
UPDATE USERS SET provider = 'local' WHERE provider IS NULL; 

select * from users;