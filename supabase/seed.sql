-- ============================================================================
-- StreamX Seed Data
-- Run this AFTER schema.sql in the Supabase SQL Editor
-- ============================================================================

-- ─── Channels ────────────────────────────────────────────────────────────────
INSERT INTO channels (id, name, avatar_url, subscribers, verified) VALUES
  ('ch1', 'TechVision',    'https://picsum.photos/seed/ch1/64/64', 4200000,  TRUE),
  ('ch2', 'GameZone Pro',  'https://picsum.photos/seed/ch2/64/64', 8700000,  TRUE),
  ('ch3', 'MusicWave',     'https://picsum.photos/seed/ch3/64/64', 12300000, TRUE),
  ('ch4', 'WorldNews24',   'https://picsum.photos/seed/ch4/64/64', 2900000,  TRUE),
  ('ch5', 'CookWithLove',  'https://picsum.photos/seed/ch5/64/64', 980000,   FALSE),
  ('ch6', 'TravelDiaries', 'https://picsum.photos/seed/ch6/64/64', 1600000,  FALSE),
  ('ch7', 'ComedyCentral', 'https://picsum.photos/seed/ch7/64/64', 5400000,  TRUE),
  ('ch8', 'SportsPulse',   'https://picsum.photos/seed/ch8/64/64', 3200000,  TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── Videos ──────────────────────────────────────────────────────────────────
INSERT INTO videos (id, title, description, thumbnail_url, video_url, duration, views, likes, dislikes, uploaded_at, category, tags, channel_id) VALUES
  ('v1',  'Next.js 14 Full Course 2024 – Build Modern Web Apps',
   E'In this comprehensive course, we dive deep into Next.js 14 and explore all the new features including Server Components, Server Actions, and the App Router.\n\n#nextjs #typescript #webdev',
   'https://picsum.photos/seed/v1/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '2:58:47', 2340000, 87400, 1200, '2024-06-15T10:30:00Z', 'Technology',
   ARRAY['nextjs','typescript','react','tailwind','webdev'], 'ch1'),

  ('v2',  'Elden Ring – Epic Boss Fights Compilation #shorts',
   E'The most epic boss battles in Elden Ring FromSoftware.\n\n#eldenring #gaming #shorts',
   'https://picsum.photos/seed/v2/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '0:58', 14700000, 542000, 8300, '2024-07-02T18:00:00Z', 'Gaming',
   ARRAY['eldenring','gaming','shorts','bossfight'], 'ch2'),

  ('v3',  'Lofi Hip Hop Radio – Beats to Relax & Study To 24/7',
   E'Your favorite lofi hip hop radio – music to relax, study and code to.\n\n#lofi #hiphop #studymusic',
   'https://picsum.photos/seed/v3/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   'LIVE', 38900000, 1200000, 12000, '2024-01-01T00:00:00Z', 'Music',
   ARRAY['lofi','hiphop','chill','studymusic','live'], 'ch3'),

  ('v4',  'Breaking: Major Economic Summit – World Leaders Meet in Geneva',
   'World leaders have gathered in Geneva for a landmark economic summit.',
   'https://picsum.photos/seed/v4/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '45:12', 890000, 23100, 3400, '2024-07-10T08:15:00Z', 'News',
   ARRAY['news','genevasummit','economy','worldnews'], 'ch4'),

  ('v5',  'Perfect Homemade Ramen in 30 Minutes – Restaurant Quality!',
   E'Today I''m showing you how to make the most incredible ramen broth at home in just 30 minutes!',
   'https://picsum.photos/seed/v5/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '18:24', 3400000, 145000, 2100, '2024-06-28T14:00:00Z', 'Cooking',
   ARRAY['ramen','cooking','recipe','food','japanese'], 'ch5'),

  ('v6',  'Solo Travel Japan 2024 – Tokyo to Kyoto on $50/Day Budget',
   E'Complete travel guide for Japan on a shoestring budget.\n\n#japan #travel #budgettravel',
   'https://picsum.photos/seed/v6/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '32:08', 6700000, 234000, 4500, '2024-05-20T09:00:00Z', 'Travel',
   ARRAY['japan','travel','tokyo','kyoto','budget'], 'ch6'),

  ('v7',  'Stand-Up Special: "Algorithm of Life" – Full Show',
   'My first full-length stand-up special! Shot live at The Comedy Store, LA.',
   'https://picsum.photos/seed/v7/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '47:33', 4100000, 178000, 5600, '2024-04-12T20:00:00Z', 'Comedy',
   ARRAY['comedy','standup','humor','special'], 'ch7'),

  ('v8',  'Champions League Final 2024 – Extended Highlights',
   E'Full extended highlights from the UEFA Champions League Final 2024.\n\n#UCLFinal #ChampionsLeague #Football',
   'https://picsum.photos/seed/v8/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '22:15', 19800000, 670000, 45000, '2024-06-01T22:00:00Z', 'Sports',
   ARRAY['ucl','football','champions-league','highlights'], 'ch8'),

  ('v9',  'React 18 Concurrent Features Explained – useTransition, Suspense & More',
   E'A deep dive into React 18''s concurrent features.',
   'https://picsum.photos/seed/v9/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '1:12:40', 1150000, 47200, 890, '2024-07-08T11:00:00Z', 'Technology',
   ARRAY['react','react18','javascript','webdev','frontend'], 'ch1'),

  ('v10', 'GTA VI Gameplay Leak Analysis – Everything We Know',
   'Analyzing every frame of leaked GTA VI gameplay footage.',
   'https://picsum.photos/seed/v10/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '28:19', 24500000, 890000, 31000, '2024-07-05T16:00:00Z', 'Gaming',
   ARRAY['gta6','gaming','rockstar','leak'], 'ch2'),

  ('v11', 'Taylor Swift – Tortured Poets Dept. Full Album Reaction',
   E'Reacting to Taylor Swift''s new album track by track!\n\n#TaylorSwift #TTPD #AlbumReaction',
   'https://picsum.photos/seed/v11/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '1:08:55', 7800000, 312000, 24000, '2024-04-19T12:00:00Z', 'Music',
   ARRAY['taylorswift','music','albumreaction','ttpd'], 'ch3'),

  ('v12', 'AI is Changing Everything – The 2024 Technology Report',
   'A comprehensive look at how artificial intelligence is transforming every industry in 2024.',
   'https://picsum.photos/seed/v12/640/360', 'https://www.w3schools.com/html/mov_bbb.mp4',
   '54:07', 5600000, 201000, 8700, '2024-07-01T09:00:00Z', 'Technology',
   ARRAY['ai','technology','future','machinelearning'], 'ch1')
ON CONFLICT (id) DO NOTHING;

-- ─── Comments ────────────────────────────────────────────────────────────────
INSERT INTO comments (id, video_id, author_id, author_name, author_avatar, content, likes, parent_id, created_at) VALUES
  ('v1_c1', 'v1', 'u1', 'DevMaster_42',    'https://picsum.photos/seed/u1/40/40',
   'This is hands down the best tutorial I''ve watched in 2024. Clear explanations and real-world examples. Thanks for making this free!',
   3421, NULL, '2024-07-10T12:00:00Z'),

  ('v1_c1_r1', 'v1', 'u2', 'ReactNinja',   'https://picsum.photos/seed/u2/40/40',
   'Totally agree! The section on Server Components alone is worth 10 other videos.',
   892, 'v1_c1', '2024-07-10T14:30:00Z'),

  ('v1_c2', 'v1', 'u3', 'CodeNewbie_Sara',  'https://picsum.photos/seed/u3/40/40',
   'Just followed along and built my first full-stack app! I''ve been struggling with the App Router for weeks but this finally made it click. Subscribed!',
   1876, NULL, '2024-07-09T18:22:00Z'),

  ('v1_c3', 'v1', 'u4', 'typescript_fan',   'https://picsum.photos/seed/u4/40/40',
   'The way you explained the difference between server and client components is genius.',
   2103, NULL, '2024-07-08T09:15:00Z'),

  ('v1_c4', 'v1', 'u5', 'WebDevMentor',     'https://picsum.photos/seed/u5/40/40',
   'I share this video with all my students. Content quality is exceptional. A++ production value too.',
   987, NULL, '2024-07-07T20:00:00Z'),

  ('v1_c5', 'v1', 'u6', 'fullstack_dev_yt', 'https://picsum.photos/seed/u6/40/40',
   'Please do a follow-up on adding real-time features with Supabase Realtime!',
   654, NULL, '2024-07-06T11:45:00Z')
ON CONFLICT (id) DO NOTHING;
