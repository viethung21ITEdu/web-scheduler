-- Migration: Add Google Calendar tokens to users table
-- Created: 2025-01-XX
-- Description: Add columns to store Google access token and refresh token for calendar sync
use web_scheduler;

ALTER TABLE users ADD google_access_token TEXT NULL;
ALTER TABLE users ADD google_refresh_token TEXT NULL;
ALTER TABLE users ADD google_token_expires_at DATETIME NULL;

-- Add index for better performance  
CREATE INDEX idx_users_google_tokens ON users(user_id);

-- Update existing Google users to have null tokens initially
UPDATE users 
SET google_access_token = NULL, 
    google_refresh_token = NULL, 
    google_token_expires_at = NULL 
WHERE provider = 'google'; 