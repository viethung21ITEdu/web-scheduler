-- Xóa database cũ nếu có (tùy chọn)
-- DROP DATABASE IF EXISTS web_scheduler;
CREATE DATABASE IF NOT EXISTS web_scheduler;
USE web_scheduler;

-- Bảng USERS - Quản lý người dùng
CREATE TABLE IF NOT EXISTS USERS (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NULL, -- Cho phép NULL khi đăng nhập bằng Google
    full_name VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('Admin', 'Leader', 'Member', 'Enterprise') NOT NULL,
    status ENUM('active', 'pending', 'inactive') DEFAULT 'pending',
    provider ENUM('local', 'google') DEFAULT 'local',
    google_id VARCHAR(255) UNIQUE,
    google_access_token TEXT,
    google_refresh_token TEXT,
    google_token_expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_status (status),
    INDEX idx_users_role (role),
    INDEX idx_google_id (google_id),
    INDEX idx_users_google_tokens (user_id)
);

-- Bảng GROUPS - Quản lý nhóm
CREATE TABLE IF NOT EXISTS `GROUPS` (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_groups_status (status)
);

-- Bảng MEMBERSHIPS - Quản lý thành viên trong nhóm
CREATE TABLE IF NOT EXISTS MEMBERSHIPS (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    role_in_group ENUM('Leader', 'Member') NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (user_id, group_id)
);

-- Bảng ENTERPRISES - Quản lý doanh nghiệp
CREATE TABLE IF NOT EXISTS ENTERPRISES (
    enterprise_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    enterprise_type ENUM('cafe', 'restaurant', 'mall', 'cinema', 'other') NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255) NOT NULL,
    description TEXT NULL,
    website VARCHAR(255) NULL,
    opening_hours VARCHAR(100) NULL,
    capacity VARCHAR(50) NULL,
    facilities JSON NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    INDEX idx_enterprises_status (status)
);

-- Bảng POSTS - Quản lý bài đăng
CREATE TABLE IF NOT EXISTS POSTS (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    enterprise_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES ENTERPRISES(enterprise_id) ON DELETE CASCADE,
    INDEX idx_posts_status (status),
    INDEX idx_posts_created_at (created_at)
);


-- Bảng EVENTS - Quản lý sự kiện
CREATE TABLE IF NOT EXISTS EVENTS (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    venue VARCHAR(255),
    status ENUM('planned', 'confirmed', 'cancelled') DEFAULT 'planned',
    participants JSON DEFAULT NULL,
    match_rate INT DEFAULT NULL COMMENT 'Tỷ lệ phù hợp (0-100%)',
    timeslots JSON,
    FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE
);

-- Cập nhật sự kiện hiện tại để leader tự động tham gia (giả sử user_id = 1 là leader)
UPDATE EVENTS SET participants = JSON_ARRAY(1) WHERE participants IS NULL; 

-- Bảng EVENT_PARTICIPANTS - Quản lý người tham gia sự kiện
CREATE TABLE IF NOT EXISTS EVENT_PARTICIPANTS (
    participant_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES EVENTS(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (event_id, user_id),
    INDEX idx_event_participants_event_id (event_id),
    INDEX idx_event_participants_user_id (user_id)
);

-- Bảng BOOKINGS - Quản lý đặt chỗ
CREATE TABLE IF NOT EXISTS BOOKINGS (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    enterprise_id INT NOT NULL,
    booker_id INT NOT NULL,
    number_of_people INT NOT NULL,
    booking_time TEXT NOT NULL,
    notes TEXT,
    status ENUM('confirmed', 'pending', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (event_id) REFERENCES EVENTS(event_id) ON DELETE CASCADE,
    FOREIGN KEY (enterprise_id) REFERENCES ENTERPRISES(enterprise_id) ON DELETE CASCADE,
    FOREIGN KEY (booker_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);


-- Bảng NOTIFICATIONS - Quản lý thông báo
CREATE TABLE IF NOT EXISTS NOTIFICATIONS (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('draft', 'sent') DEFAULT 'draft',
    recipients_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    fail_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES EVENTS(event_id) ON DELETE CASCADE
);

-- Bảng LOCATIONS - Quản lý địa điểm
CREATE TABLE IF NOT EXISTS LOCATIONS (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT,
    address VARCHAR(500) NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE,
    INDEX idx_user_group (user_id, group_id)
);

-- Bảng TIMESLOTS - Quản lý khung giờ
CREATE TABLE IF NOT EXISTS TIMESLOTS (
    timeslot_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    -- google_calendar_event_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE,
    INDEX idx_user_group (user_id, group_id)
);

-- Bảng PREFERENCES - Quản lý sở thích
CREATE TABLE IF NOT EXISTS PREFERENCES (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT,
    preferences_json JSON,
    other_preference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_group_pref (user_id, group_id)
);


-- Bảng GROUP_INVITES - Quản lý lời mời tham gia nhóm
CREATE TABLE IF NOT EXISTS GROUP_INVITES (
    invite_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    inviter_id INT NOT NULL,
    invite_code VARCHAR(100) NOT NULL UNIQUE,
    invite_type ENUM('link', 'email') NOT NULL,
    email VARCHAR(100) NULL,
    status ENUM('pending', 'used', 'expired') DEFAULT 'pending',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    used_by INT NULL,
    FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- Bảng GROUP_JOIN_REQUESTS - Quản lý yêu cầu tham gia nhóm
CREATE TABLE IF NOT EXISTS GROUP_JOIN_REQUESTS (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    invite_id INT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT NULL,
    FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (invite_id) REFERENCES GROUP_INVITES(invite_id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES USERS(user_id) ON DELETE SET NULL
);