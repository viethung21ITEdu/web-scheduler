-- Tạo bảng USERS nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS USERS (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('Admin', 'Member', 'Enterprise') NOT NULL DEFAULT 'Member',
  status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng GROUPS nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS `GROUPS` (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng MEMBERSHIPS nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS MEMBERSHIPS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  role_in_group ENUM('Leader', 'Member') NOT NULL DEFAULT 'Member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE,
  UNIQUE KEY unique_membership (user_id, group_id)
);

-- Tạo bảng ENTERPRISES nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS ENTERPRISES (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  enterprise_type VARCHAR(50) NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- Tạo bảng EVENTS nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS EVENTS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  venue VARCHAR(200),
  status ENUM('pending', 'confirmed', 'canceled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES `GROUPS`(group_id) ON DELETE CASCADE
);

-- Tạo bảng BOOKINGS nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS BOOKINGS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  enterprise_id INT NOT NULL,
  booker_id INT NOT NULL,
  number_of_people INT NOT NULL,
  booking_time DATETIME NOT NULL,
  notes TEXT,
  status ENUM('pending', 'confirmed', 'canceled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES EVENTS(id) ON DELETE CASCADE,
  FOREIGN KEY (enterprise_id) REFERENCES ENTERPRISES(id) ON DELETE CASCADE,
  FOREIGN KEY (booker_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- Tạo bảng POSTS nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS POSTS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enterprise_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (enterprise_id) REFERENCES ENTERPRISES(id) ON DELETE CASCADE
);
