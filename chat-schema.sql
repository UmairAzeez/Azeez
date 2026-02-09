-- Chat messages table (separate from contact form messages)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by session
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- No public access (backend uses service role key which bypasses RLS)
CREATE POLICY "Backend only" ON chat_messages
  FOR ALL
  USING (false);
