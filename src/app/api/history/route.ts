import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');
const VIDEOS_PATH = path.join(process.cwd(), 'data', 'videos.json');
const CHANNELS_PATH = path.join(process.cwd(), 'data', 'channels.json');

async function readJSON(filePath: string) {
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return filePath.endsWith('.json') && filePath.includes('users') ? {} : [];
  }
}

async function writeJSON(filePath: string, data: any) {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

// GET /api/history?userId=123
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const users = await readJSON(USERS_PATH);
    const user = users[userId];

    if (!user || !user.watch_history?.length) {
      return NextResponse.json([]);
    }

    const videos = await readJSON(VIDEOS_PATH);
    const channels = await readJSON(CHANNELS_PATH);

    // Fetch the actual videos and join with channels
    const historyVideos = user.watch_history
      .map((id: string) => {
        const video = (videos as any[]).find((v) => v.id === id);
        if (video) {
          const cid = video.channel_id || 'default';
          const freshChannel = channels[cid];
          return { ...video, channels: freshChannel || { id: cid, name: 'Unknown' } };
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json(historyVideos);
  } catch (err: any) {
    console.error('Failed to fetch history:', err);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

// POST /api/history
export async function POST(req: NextRequest) {
  try {
    const { videoId, userId } = await req.json();

    if (!videoId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const users = await readJSON(USERS_PATH);
    let user = users[userId] || { id: userId, watch_history: [] };

    let history: string[] = user.watch_history || [];

    // Remove if exists to move to top
    history = history.filter((id) => id !== videoId);
    
    // Add to top
    history.unshift(videoId);

    // Keep only last 50 items
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    user.watch_history = history;
    users[userId] = user;
    
    await writeJSON(USERS_PATH, users);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to save history:', err);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}
