-- Run this SQL in Supabase SQL Editor to enable all features

-- 1. Create public_chats table for chat functionality
CREATE TABLE IF NOT EXISTS public_chats (
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

-- 2. Create live_locations table for live location sharing
CREATE TABLE IF NOT EXISTS live_locations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_sharing BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active live locations
CREATE POLICY "Allow public read live locations" ON live_locations FOR SELECT USING (true);

-- Allow anyone to insert/update their own location
CREATE POLICY "Allow public insert live locations" ON live_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update live locations" ON live_locations FOR UPDATE USING (true);

-- 3. Update reports table to keep incidents for 48 hours (optional, for reference)
-- The MapDisplay component will be updated to show reports from last 48 hours

-- IMPORTANT: After running this SQL, go to Database → Replication
-- and enable replication for both 'public_chats' and 'live_locations' tables
