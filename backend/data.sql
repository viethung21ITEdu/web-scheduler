USE web_scheduler;
-- USERS
INSERT INTO USERS (username, email, password, full_name, phone, role, status) VALUES
('admin', 'admin@example.com', 'adminpass', 'Admin User', '0123456789', 'Admin', 'active'),
('leader1', 'leader1@example.com', 'leaderpass', 'Leader One', '0987654321', 'Leader', 'active'),
('member1', 'member1@example.com', 'memberpass', 'Member One', '0911222333', 'Member', 'active'),
('enterprise1', 'ent1@example.com', 'entpass', 'Enterprise One', '0909090909', 'Enterprise', 'active');

-- GROUPS
INSERT INTO `GROUPS` (name, description, status) VALUES
('Nhóm A', 'Nhóm học tập A', 'active'),
('Nhóm B', 'Nhóm học tập B', 'active');

-- MEMBERSHIPS
INSERT INTO MEMBERSHIPS (user_id, group_id, role_in_group) VALUES
(2, 1, 'Leader'),
(3, 1, 'Member'),
(2, 2, 'Leader');

-- ENTERPRISES
INSERT INTO ENTERPRISES (user_id, name, enterprise_type, contact_person, phone) VALUES
(4, 'Quán Cafe ABC', 'cafe', 'Nguyễn Văn A', '0909090909'),
(4, 'Nhà hàng XYZ', 'restaurant', 'Trần Thị B', '0911223344');

-- POSTS
INSERT INTO POSTS (enterprise_id, title, content, status) VALUES
(1, 'Khuyến mãi tháng 5', 'Giảm giá 20% cho sinh viên', 'approved'),
(2, 'Món mới ra mắt', 'Thưởng thức món mới tại nhà hàng XYZ', 'pending');

-- EVENTS
INSERT INTO EVENTS (group_id, name, start_time, end_time, venue, status) VALUES
(1, 'Họp nhóm tuần 1', '2025-05-10 09:00:00', '2025-05-10 11:00:00', 'Quán Cafe ABC', 'planned'),
(2, 'Họp nhóm tuần 2', '2025-05-17 14:00:00', '2025-05-17 16:00:00', 'Nhà hàng XYZ', 'confirmed');

-- BOOKINGS
INSERT INTO BOOKINGS (event_id, enterprise_id, booker_id, number_of_people, booking_time, notes, status) VALUES
(1, 1, 2, 5, '2025-05-09 10:00:00', 'Đặt trước cho nhóm A', 'confirmed'),
(2, 2, 2, 7, '2025-05-16 15:00:00', 'Đặt cho nhóm B', 'pending');

-- NOTIFICATIONS
INSERT INTO NOTIFICATIONS (event_id, title, content, status) VALUES
(1, 'Nhắc nhở họp nhóm', 'Đừng quên họp nhóm tuần này!', 'sent'),
(2, 'Thông báo sự kiện', 'Sự kiện tuần sau đã được xác nhận', 'draft');

-- LOCATIONS
INSERT INTO LOCATIONS (user_id, address, latitude, longitude, note) VALUES
(2, '123 Đường A, TP.HCM', 10.762622, 106.660172, 'Địa điểm quen thuộc'),
(3, '456 Đường B, TP.HCM', 10.776889, 106.700806, 'Gần trường học');

-- TIMESLOTS
INSERT INTO TIMESLOTS (user_id, start_time, end_time) VALUES
-- User leader1 (user_id = 2) - Timeslots trong tuần tháng 6/2025
(5, '2025-06-02 08:00:00', '2025-06-02 12:00:00'),
(5, '2025-06-03 14:00:00', '2025-06-03 18:00:00'),
(5, '2025-06-04 09:30:00', '2025-06-04 11:30:00'),
(5, '2025-06-05 15:00:00', '2025-06-05 17:00:00'),
(5, '2025-06-06 13:00:00', '2025-06-06 16:00:00'),
(6, '2025-06-02 10:00:00', '2025-06-02 14:00:00'),
(6, '2025-06-03 08:30:00', '2025-06-03 10:30:00'),
(6, '2025-06-04 14:30:00', '2025-06-04 17:30:00'),
(6, '2025-06-05 09:00:00', '2025-06-05 12:00:00'),
(7, '2025-06-06 16:00:00', '2025-06-06 19:00:00'),
-- User enterprise1 (user_id = 4) - Timeslots làm việc tháng 6/2025
(7, '2025-06-02 07:00:00', '2025-06-02 22:00:00'),
(7, '2025-06-03 07:00:00', '2025-06-03 22:00:00'),
(7, '2025-06-04 07:00:00', '2025-06-04 22:00:00'),
(7, '2025-06-05 07:00:00', '2025-06-05 22:00:00'),
(7, '2025-06-06 07:00:00', '2025-06-06 22:00:00'),
-- Thêm timeslots cho tuần sau trong tháng 6
(8, '2025-06-09 09:00:00', '2025-06-09 13:00:00'),
(8, '2025-06-10 14:30:00', '2025-06-10 18:30:00'),
(8, '2025-06-11 10:00:00', '2025-06-11 12:00:00'),
(9, '2025-06-09 08:00:00', '2025-06-09 12:00:00'),
(9, '2025-06-10 13:00:00', '2025-06-10 16:00:00'),
(9, '2025-06-11 15:00:00', '2025-06-11 18:00:00'),
-- Timeslots cho cuối tuần tháng 6
(9, '2025-06-07 10:00:00', '2025-06-07 15:00:00'),
(9, '2025-06-08 14:00:00', '2025-06-08 17:00:00'),
(9, '2025-06-07 09:00:00', '2025-06-07 13:00:00'),
(9, '2025-06-08 16:00:00', '2025-06-08 20:00:00'),
-- Timeslots trong tháng tiếp theo (tháng 7/2025)
(6, '2025-07-02 08:30:00', '2025-07-02 12:30:00'),
(6, '2025-07-03 13:00:00', '2025-07-03 17:00:00'),
(6, '2025-07-04 09:00:00', '2025-07-04 11:00:00'),
(7, '2025-07-02 10:30:00', '2025-07-02 14:30:00'),
(7, '2025-07-03 15:00:00', '2025-07-03 18:00:00'),
(7, '2025-07-04 08:00:00', '2025-07-04 10:00:00'),
-- Timeslots đặc biệt (buổi tối, thời gian dài) tháng 6
(6, '2025-06-20 19:00:00', '2025-06-20 22:00:00'),
(6, '2025-06-21 18:30:00', '2025-06-21 21:30:00'),
-- Timeslots cho ngày hè đặc biệt
(6, '2025-06-21 10:00:00', '2025-06-21 16:00:00'),
(7, '2025-06-21 14:00:00', '2025-06-21 18:00:00');

-- PREFERENCES
INSERT INTO PREFERENCES (user_id, type) VALUES
(2, 'cafe'),
(3, 'restaurant');
