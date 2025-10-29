-- Migration: Add status column to users table
-- Purpose: Track user status (ACTIVE, INACTIVE, SUSPENDED) separately from isActive
-- Date: 2025-01-29

-- Add status column
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20);

-- Set default status based on existing isActive field
UPDATE users 
SET status = CASE 
    WHEN is_active = TRUE THEN 'ACTIVE'
    WHEN is_active = FALSE THEN 'INACTIVE'
    ELSE 'ACTIVE'
END
WHERE status IS NULL;

-- Set default value for future records
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'ACTIVE';

-- Add check constraint
ALTER TABLE users ADD CONSTRAINT check_user_status 
CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

COMMENT ON COLUMN users.status IS 'User account status: ACTIVE, INACTIVE, SUSPENDED';
