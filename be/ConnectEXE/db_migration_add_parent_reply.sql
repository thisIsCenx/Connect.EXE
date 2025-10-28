-- Migration: Add parent_reply_id column for nested replies
-- This will be automatically handled by Hibernate with ddl-auto=update
-- But this file serves as documentation and backup

-- Add parent_reply_id column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forum_replies' 
        AND column_name = 'parent_reply_id'
    ) THEN
        ALTER TABLE forum_replies 
        ADD COLUMN parent_reply_id VARCHAR(12);
        
        -- Add foreign key constraint
        ALTER TABLE forum_replies
        ADD CONSTRAINT fk_forum_reply_parent
        FOREIGN KEY (parent_reply_id) 
        REFERENCES forum_replies(reply_id)
        ON DELETE CASCADE;
        
        -- Add index for better performance
        CREATE INDEX idx_forum_replies_parent_id 
        ON forum_replies(parent_reply_id);
        
        CREATE INDEX idx_forum_replies_topic_parent 
        ON forum_replies(topic_id, parent_reply_id);
        
        RAISE NOTICE 'Successfully added parent_reply_id column and indexes';
    ELSE
        RAISE NOTICE 'Column parent_reply_id already exists';
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'forum_replies'
ORDER BY ordinal_position;
