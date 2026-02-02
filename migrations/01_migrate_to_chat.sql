-- Migration to Chat System
-- WARNING: This will clear existing messages to ensure schema consistency
TRUNCATE TABLE messages;

-- Add new columns for chat functionality
ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS session_id UUID NOT NULL DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS sender_type TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
    ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS content TEXT;

-- Migrate existing 'message' content to 'content' if needed (though we truncated)
-- UPDATE messages SET content = message;

-- Remove obsolete columns
ALTER TABLE messages 
    DROP COLUMN IF EXISTS reply,
    DROP COLUMN IF EXISTS message; -- We rely on 'content' now

-- Create index for faster session queries
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Update RLS policies (if enabled) to allow access
-- (Assuming we are using Service Key for now which bypasses RLS, but tailored policies are good)
