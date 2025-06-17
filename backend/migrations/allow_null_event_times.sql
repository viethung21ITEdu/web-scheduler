-- Migration: Cho phép start_time và end_time có thể NULL trong bảng EVENTS
-- Ngày tạo: 2025-01-20

USE web_scheduler;

-- Sửa đổi cột start_time để cho phép NULL
ALTER TABLE EVENTS MODIFY COLUMN start_time DATETIME NULL;

-- Sửa đổi cột end_time để cho phép NULL  
ALTER TABLE EVENTS MODIFY COLUMN end_time DATETIME NULL;

-- Kiểm tra kết quả
DESCRIBE EVENTS; 