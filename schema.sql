-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  message TEXT NOT NULL CHECK (char_length(message) <= 2000),
  reply TEXT CHECK (char_length(reply) <= 2000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- No public access (backend uses service role key which bypasses RLS)
CREATE POLICY "Backend only" ON messages
  FOR ALL
  USING (false);
