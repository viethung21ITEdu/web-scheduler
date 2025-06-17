USE web_scheduler;

-- Thêm events mẫu cho group 12 (Nhóm Test Web UI)
INSERT INTO EVENTS (group_id, name, start_time, end_time, venue, status) VALUES
(12, 'Họp nhóm Test UI - Sprint 1', '2025-01-20 14:00:00', '2025-01-20 16:00:00', 'Quán Cafe ABC', 'confirmed'),
(12, 'Demo sản phẩm web', '2025-01-25 09:00:00', '2025-01-25 11:30:00', 'Phòng họp A101', 'planned'),
(12, 'Workshop UI/UX Design', '2025-01-30 13:00:00', '2025-01-30 17:00:00', 'Coworking Space XYZ', 'planned');

-- Kiểm tra kết quả
SELECT * FROM EVENTS WHERE group_id = 12; 

