import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'videos.json');
const CHANNELS_PATH = path.join(process.cwd(), 'data', 'channels.json');

async function readDB() {
  try {
    const data = await readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeDB(data: any) {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

async function readChannels() {
  try {
    const data = await readFile(CHANNELS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeChannels(data: any) {
  await writeFile(CHANNELS_PATH, JSON.stringify(data, null, 2));
}

// GET /api/videos — list all videos
export async function GET(req: NextRequest) {
  try {
    const videos = await readDB();
    const channels = await readChannels();
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const sortBy = searchParams.get('sortBy');
    const excludeId = searchParams.get('excludeId');
    const channelId = searchParams.get('channelId');
    const limit = parseInt(searchParams.get('limit') ?? '0', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const shortsOnly = searchParams.get('shortsOnly') === 'true';
    const excludeShorts = searchParams.get('excludeShorts') === 'true';

    // Overlay channel data
    let filtered = (videos as any[]).map((v) => {
      const cid = v.channel_id || 'default';
      const freshChannel = channels[cid];
      return { 
        ...v, 
        channels: freshChannel || { 
          id: cid, 
          name: 'Unknown User', 
          avatar_url: `https://picsum.photos/seed/${cid}/64/64`,
          subscribers: 0,
          verified: false
        } 
      };
    });

    if (shortsOnly) {
      filtered = filtered.filter((v) => v.is_short === true);
    } else if (excludeShorts) {
      filtered = filtered.filter((v) => v.is_short !== true);
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((v) => v.category === category);
    }
    
    if (channelId) {
      filtered = filtered.filter((v) => v.channel_id === channelId);
    }
    
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter((v) => v.title.toLowerCase().includes(q));
    }
    
    if (excludeId) {
      filtered = filtered.filter((v) => v.id !== excludeId);
    }

    if (sortBy === 'views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      filtered.sort((a, b) => 
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
      );
    }

    if (limit > 0) {
      filtered = filtered.slice(offset, offset + limit);
    }

    // Include matched channels if it's a search query
    let matchedChannels: any[] = [];
    if (query && !shortsOnly && !excludeId && !channelId && !category) {
      const q = query.toLowerCase();
      matchedChannels = Object.values(channels).filter((c: any) => 
        c.name.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      videos: filtered,
      channels: matchedChannels
    });
  } catch (err: any) {
    console.error('Failed to fetch videos:', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST /api/videos — insert a new video
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const videos = await readDB();
    const channels = await readChannels();

    const channelId = body.channel_id ?? 'default';

    // Update or create channel info
    if (body.channel_name || !channels[channelId]) {
      channels[channelId] = {
        ... (channels[channelId] || { subscribers: 0, verified: false }),
        id: channelId,
        name: body.channel_name || channels[channelId]?.name || 'My Channel',
        avatar_url: body.channel_avatar_url || channels[channelId]?.avatar_url || 'https://picsum.photos/seed/default/64/64',
      };
      await writeChannels(channels);
    }

    const newVideo = {
      id: body.id,
      title: body.title,
      description: body.description || '',
      thumbnail_url: body.thumbnail_url,
      video_url: body.video_url,
      duration: body.duration,
      category: body.category,
      tags: body.tags || [],
      channel_id: channelId,
      is_short: body.is_short || false,
      views: 0,
      likes: 0,
      dislikes: 0,
      uploaded_at: new Date().toISOString(),
    };

    videos.push(newVideo);
    await writeDB(videos);

    return NextResponse.json({ ...newVideo, channels: channels[channelId] });
  } catch (err: any) {
    console.error('Failed to save video metadata:', err);
    return NextResponse.json({ error: err?.message ?? 'Failed to save' }, { status: 500 });
  }
}

