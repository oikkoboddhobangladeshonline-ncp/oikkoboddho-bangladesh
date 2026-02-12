# Supabase Database Setup

## Required Tables

### 1. reports (Already exists)
```sql
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT,
  image_url TEXT,
  video_link TEXT,
  reporter_info TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. public_chats (MISSING - Need to create)
```sql
CREATE TABLE public_chats (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  user_id TEXT,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  type TEXT DEFAULT 'public',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public_chats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Allow public read access" ON public_chats FOR SELECT USING (true);

-- Allow anyone to insert
CREATE POLICY "Allow public insert access" ON public_chats FOR INSERT WITH CHECK (true);
```

### 3. Enable Realtime for public_chats
```sql
-- In Supabase Dashboard:
-- 1. Go to Database → Replication
-- 2. Enable replication for 'public_chats' table
```

## Quick Setup Steps

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on "SQL Editor"
3. Create a new query
4. Copy and paste the `public_chats` table creation SQL above
5. Click "Run"
6. Go to Database → Replication
7. Enable replication for `public_chats` table
8. Done!

## Verification

Run this query to verify:
```sql
SELECT * FROM public_chats LIMIT 1;
```

If it returns no errors, you're good to go!
