-- Migration script for nested replies support
-- Add parent_reply_id column to forum_replies table

-- Add the parent_reply_id column
ALTER TABLE forum_replies 
ADD COLUMN parent_reply_id VARCHAR(12);

-- Add foreign key constraint (optional but recommended)
ALTER TABLE forum_replies
ADD CONSTRAINT fk_parent_reply
FOREIGN KEY (parent_reply_id) 
REFERENCES forum_replies(reply_id)
ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_forum_replies_parent_id ON forum_replies(parent_reply_id);
CREATE INDEX idx_forum_replies_topic_parent ON forum_replies(topic_id, parent_reply_id);

-- Optional: Add check constraint to prevent self-referencing
ALTER TABLE forum_replies
ADD CONSTRAINT chk_no_self_reference 
CHECK (reply_id != parent_reply_id);

-- Update existing replies to have NULL parent_reply_id (already NULL by default)
-- This is just for documentation purposes
-- UPDATE forum_replies SET parent_reply_id = NULL WHERE parent_reply_id IS NULL;

COMMENT ON COLUMN forum_replies.parent_reply_id IS 'ID of parent reply for nested comments. NULL for root-level replies.';
