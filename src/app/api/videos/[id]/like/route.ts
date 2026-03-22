import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const VIDEOS_PATH = path.join(process.cwd(), 'data', 'videos.json');

async function readDB() {
  try {
    const data = await readFile(VIDEOS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeDB(data: any) {
  await writeFile(VIDEOS_PATH, JSON.stringify(data, null, 2));
}

// POST /api/videos/[id]/like — update like/dislike (One per user)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action, userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const videos = await readDB();
    const index = (videos as any[]).findIndex((v) => v.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = videos[index];
    
    // Initialize trackers if they don't exist
    if (!video.liked_by) video.liked_by = [];
    if (!video.disliked_by) video.disliked_by = [];

    const alreadyLiked = video.liked_by.includes(userId);
    const alreadyDisliked = video.disliked_by.includes(userId);

    // Reset status
    video.liked_by = video.liked_by.filter((id: string) => id !== userId);
    video.disliked_by = video.disliked_by.filter((id: string) => id !== userId);

    // Apply new action
    if (action === 'like') {
      if (!alreadyLiked) {
        video.liked_by.push(userId);
      }
    } else if (action === 'dislike') {
      if (!alreadyDisliked) {
        video.disliked_by.push(userId);
      }
    }
    // If action is 'none', we just leave it filtered (unliked/undisliked)

    // Update counts based on arrays
    video.likes = video.liked_by.length;
    video.dislikes = video.disliked_by.length;
    
    await writeDB(videos);

    return NextResponse.json({ 
      likes: video.likes, 
      dislikes: video.dislikes,
      userReaction: action
    });
  } catch (err: any) {
    console.error('Failed to update likes:', err);
    return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 });
  }
}
