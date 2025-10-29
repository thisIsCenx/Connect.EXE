-- Migration script to add project features
-- Run this script to update the projects table with new columns

-- Add new columns to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'OTHER',
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS members TEXT,
ADD COLUMN IF NOT EXISTS website_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS github_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS demo_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Update existing projects to have default values
UPDATE projects
SET 
    category = COALESCE(category, 'OTHER'),
    status = COALESCE(status, 'PENDING'),
    updated_at = COALESCE(updated_at, created_at),
    is_public = COALESCE(is_public, true)
WHERE category IS NULL OR status IS NULL OR updated_at IS NULL;

-- Ensure description column is TEXT type
ALTER TABLE projects
ALTER COLUMN description TYPE TEXT;

-- Create index on commonly queried columns for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

-- Create index on votes table for better query performance
CREATE INDEX IF NOT EXISTS idx_votes_user_project ON votes(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_votes_project ON votes(project_id);
CREATE INDEX IF NOT EXISTS idx_votes_upvote ON votes(is_upvote);

-- Verify the migration
SELECT 'Projects table updated successfully' AS status;
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;
