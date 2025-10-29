-- Migration: Add image_urls column to forum_topics and forum_replies tables
-- Description: Adds TEXT[] array column to store Cloudinary image URLs
-- Date: 2025-10-29

-- Add image_urls column to forum_topics table
ALTER TABLE forum_topics 
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

COMMENT ON COLUMN forum_topics.image_urls IS 'Array of Cloudinary image URLs (max 5 images)';

-- Add image_urls column to forum_replies table
ALTER TABLE forum_replies 
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

COMMENT ON COLUMN forum_replies.image_urls IS 'Array of Cloudinary image URLs (max 5 images)';

-- Create index for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_forum_topics_image_urls ON forum_topics USING GIN (image_urls);
CREATE INDEX IF NOT EXISTS idx_forum_replies_image_urls ON forum_replies USING GIN (image_urls);

-- Verify changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('forum_topics', 'forum_replies') 
AND column_name = 'image_urls';
