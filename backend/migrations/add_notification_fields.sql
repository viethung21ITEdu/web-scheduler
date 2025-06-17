-- Migration: Thêm các trường mới vào bảng NOTIFICATIONS
-- Chạy script này để cập nhật database hiện có

USE web_scheduler;

-- Thêm các trường mới vào bảng NOTIFICATIONS
ALTER TABLE NOTIFICATIONS 
ADD recipients_count INT DEFAULT 0,
ADD success_count INT DEFAULT 0,
ADD fail_count INT DEFAULT 0,
ADD updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Cập nhật dữ liệu hiện có (nếu có)
UPDATE NOTIFICATIONS 
SET recipients_count = 0, success_count = 0, fail_count = 0, updated_at = created_at
WHERE recipients_count IS NULL;

-- Hiển thị cấu trúc bảng sau khi cập nhật
DESCRIBE NOTIFICATIONS; 