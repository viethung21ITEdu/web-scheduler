-- Migration: Add columns for admin dashboard
-- Date: 2025-01-06

-- Add missing columns to ENTERPRISES table (run manually if needed)
-- ALTER TABLE ENTERPRISES ADD COLUMN contact_person VARCHAR(100);
-- ALTER TABLE ENTERPRISES ADD COLUMN phone VARCHAR(20);
-- ALTER TABLE ENTERPRISES ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active';

-- Update existing enterprises to have active status
UPDATE ENTERPRISES SET status = 'active' WHERE status IS NULL;

-- Add user_id column to POSTS table if not exists (for better admin management)
-- ALTER TABLE POSTS ADD COLUMN IF NOT EXISTS user_id INT;
-- ALTER TABLE POSTS ADD FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE SET NULL;

-- Ensure all required indexes exist (run manually if needed)
-- CREATE INDEX idx_posts_status ON POSTS(status);
-- CREATE INDEX idx_posts_created_at ON POSTS(created_at);
-- CREATE INDEX idx_enterprises_status ON ENTERPRISES(status);
-- CREATE INDEX idx_users_status ON USERS(status);
-- CREATE INDEX idx_users_role ON USERS(role);
-- CREATE INDEX idx_groups_status ON `GROUPS`(status); 