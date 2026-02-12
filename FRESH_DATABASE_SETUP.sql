-- 🚀 COMPLETE FRESH SETUP - Run this in Supabase SQL Editor
-- This creates all tables needed for the app

-- ============================================
-- 1. CREATE REPORTS TABLE (Main incidents)
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
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

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "reports_select_policy" ON reports FOR SELECT USING (true);

-- Allow anyone to insert
CREATE POLICY "reports_insert_policy" ON reports FOR INSERT WITH CHECK (true);

-- ============================================
-- 2. CREATE PUBLIC_CHATS TABLE (Chat messages)
-- ============================================
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
CREATE POLICY "public_chats_select_policy" ON public_chats FOR SELECT USING (true);

-- Allow anyone to insert
CREATE POLICY "public_chats_insert_policy" ON public_chats FOR INSERT WITH CHECK (true);

-- ============================================
-- 3. CREATE LIVE_LOCATIONS TABLE (Live tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS live_locations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_sharing BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "live_locations_select_policy" ON live_locations FOR SELECT USING (true);

-- Allow anyone to insert
CREATE POLICY "live_locations_insert_policy" ON live_locations FOR INSERT WITH CHECK (true);

-- Allow anyone to update
CREATE POLICY "live_locations_update_policy" ON live_locations FOR UPDATE USING (true);

-- Allow anyone to delete
CREATE POLICY "live_locations_delete_policy" ON live_locations FOR DELETE USING (true);

-- ============================================
-- 4. VERIFY TABLES CREATED
-- ============================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('reports', 'public_chats', 'live_locations')
ORDER BY table_name;

-- ============================================
-- NEXT STEPS:
-- ============================================
-- After running this SQL:
-- 1. Go to Database → Replication
-- 2. Enable replication for:
--    ✅ reports
--    ✅ public_chats
--    ✅ live_locations
-- 3. Done! Your app is ready to use!
