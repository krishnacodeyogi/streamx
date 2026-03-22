-- ============================================================================
-- StreamX Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard → SQL)
-- ============================================================================

-- ─── Channels ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS channels (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  subscribers INTEGER DEFAULT 0,
  verified    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Videos ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  video_url     TEXT,
  duration      TEXT,
  views         INTEGER DEFAULT 0,
  likes         INTEGER DEFAULT 0,
  dislikes      INTEGER DEFAULT 0,
  uploaded_at   TIMESTAMPTZ DEFAULT now(),
  category      TEXT NOT NULL,
  tags          TEXT[] DEFAULT '{}',
  channel_id    TEXT REFERENCES channels(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── Comments ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,
  video_id    TEXT REFERENCES videos(id) ON DELETE CASCADE,
  author_id   TEXT,
  author_name TEXT,
  author_avatar TEXT,
  content     TEXT NOT NULL,
  likes       INTEGER DEFAULT 0,
  parent_id   TEXT REFERENCES comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Users (auth-ready) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             TEXT PRIMARY KEY,
  email          TEXT UNIQUE,
  name           TEXT,
  avatar_url     TEXT,
  subscribers    INTEGER DEFAULT 0,
  subscriptions  TEXT[] DEFAULT '{}',
  liked_videos   TEXT[] DEFAULT '{}',
  watch_history  TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_channel_id ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded_at ON videos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- ─── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Public read access for channels and videos
CREATE POLICY "Public read channels" ON channels FOR SELECT USING (true);
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Auth insert comments" ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Anyone can insert videos (for upload without auth)
CREATE POLICY "Public insert videos" ON videos FOR INSERT
  WITH CHECK (true);

-- Anyone can insert channels (for default channel creation)
CREATE POLICY "Public insert channels" ON channels FOR INSERT
  WITH CHECK (true);

-- Users can read/update their own profile
CREATE POLICY "Users read own profile" ON users FOR SELECT
  USING (auth.uid()::text = id);
CREATE POLICY "Users update own profile" ON users FOR UPDATE
  USING (auth.uid()::text = id);

-- ─── Default channel for uploads ───────────────────────────────────────────
INSERT INTO channels (id, name, avatar_url, subscribers, verified)
VALUES ('default', 'My Channel', 'https://picsum.photos/seed/default/64/64', 0, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Migrations & Updates
-- ============================================================================

-- Add is_short column to videos table
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_short BOOLEAN DEFAULT false;

-- ============================================================================
-- Supabase Storage Setup Instructions
-- ============================================================================
-- 1. Go to Supabase Dashboard -> Storage
-- 2. Create a new bucket named "media"
-- 3. Make the bucket "Public"
-- 4. Create a new Policy under Configuration -> Policies for the "media" bucket:
--    - Name: "Public Access"
--    - Allowed Operations: SELECT, INSERT, UPDATE, DELETE
--    - Target roles: anon, authenticated
--    - Policy definition: true (allow all)
