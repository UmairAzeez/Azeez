# Fix Chat Widget - Quick Guide

## Problem
The chat widget is getting 500 errors because the database table doesn't exist.

## Solution

### Step 1: Add Chat Messages Table to Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New query**
5. Copy and paste this SQL:

```sql
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
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Step 2: Verify

1. Go to **Table Editor** (left sidebar)
2. You should now see two tables:
   - `messages` (for contact form)
   - `chat_messages` (for chat widget)

### Step 3: Test

1. Refresh your website
2. The chat widget should now work without 500 errors
3. Try sending a message in the chat
4. Check Supabase Table Editor → `chat_messages` to see the message

## What Was Fixed

I updated these files:
- ✅ `netlify/functions/get-chat.js` - Now uses `chat_messages` table
- ✅ `netlify/functions/messages.js` - Now uses `chat_messages` table and correct fields
- ✅ Created `netlify/functions/send-message.js` - Manager can send chat messages
- ✅ Created `netlify/functions/get-sessions.js` - Manager can see all chat sessions
- ✅ Created `chat-schema.sql` - SQL to create the chat_messages table

## Two Separate Systems

You now have:
1. **Contact Form** → saves to `messages` table (name, message, reply)
2. **Chat Widget** → saves to `chat_messages` table (session_id, name, content, sender_type)

Both work independently!

## Available Functions

### Public (Chat Widget)
- `POST /.netlify/functions/messages` - Send chat message (user)
- `GET /.netlify/functions/get-chat?session_id=xxx` - Get chat history

### Manager (Dashboard)
- `POST /.netlify/functions/manager-login` - Manager login
- `GET /.netlify/functions/get-sessions` - Get all chat sessions
- `GET /.netlify/functions/get-chat?session_id=xxx` - Get specific chat
- `POST /.netlify/functions/send-message` - Send message as manager

## Next Steps

After running the SQL:
1. Refresh your website
2. Test the chat widget
3. Send a test message
4. Check Supabase to see it saved
5. Login to manager dashboard to reply
