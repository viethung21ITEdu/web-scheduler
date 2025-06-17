-- Migration: Add timeslots JSON field to events table
-- Date: 2025-01-XX
-- Description: Add support for storing multiple time slots as JSON

USE group_management;

-- Add timeslots column to events table
ALTER TABLE events ADD COLUMN timeslots JSON;

-- Update existing events to have null timeslots (they will use legacy start_time/end_time)
-- No need to update existing data as NULL is the default

-- Verify the change
DESCRIBE events; 