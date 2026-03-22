import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'videos.json');
const CHANNELS_PATH = path.join(process.cwd(), 'data', 'channels.json');
const COMMENTS_PATH = path.join(process.cwd(), 'data', 'comments.json');

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

async function readComments() {
  try {
    const data = await readFile(COMMENTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeComments(data: any) {
  await writeFile(COMMENTS_PATH, JSON.stringify(data, null, 2));
}

// GET /api/videos/[id] — get a single video by id with fresh channel data
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const videos = await readDB();
    const channels = await readChannels();
    const video = (videos as any[]).find((v) => v.id === params.id);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const cid = video.channel_id || 'default';
    const freshChannel = channels[cid];
    
    return NextResponse.json({
      ...video,
      channels: freshChannel || { 
        id: cid, 
        name: 'Unknown User', 
        avatar_url: `https://picsum.photos/seed/${cid}/64/64`,
        subscribers: 0,
        verified: false
      }
    });
  } catch (err: any) {
    console.error('Failed to fetch video:', err);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}

// DELETE /api/videos/[id] — delete a video (Owner only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const videos = await readDB();
    const videoIndex = (videos as any[]).findIndex((v) => v.id === params.id);

    if (videoIndex === -1) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = videos[videoIndex];

    // 2. Authorization check
    if (video.channel_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized: Only the owner can delete this video' }, { status: 403 });
    }

    // 3. Delete files from disk if they are local uploads
    if (video.video_url && video.video_url.startsWith('/uploads/')) {
      const videoPath = path.join(process.cwd(), 'public', video.video_url);
      try {
        await unlink(videoPath);
      } catch (e) {
        console.error('Failed to delete video file:', e);
      }
    }

    if (video.thumbnail_url && video.thumbnail_url.startsWith('/uploads/')) {
      const thumbPath = path.join(process.cwd(), 'public', video.thumbnail_url);
      try {
        await unlink(thumbPath);
      } catch (e) {
        console.error('Failed to delete thumbnail file:', e);
      }
    }

    // 4. Delete from Database (local JSON)
    videos.splice(videoIndex, 1);
    await writeDB(videos);

    // 5. Delete associated comments
    const comments = await readComments();
    const filteredComments = comments.filter((c: any) => c.video_id !== params.id);
    if (comments.length !== filteredComments.length) {
      await writeComments(filteredComments);
    }

    return NextResponse.json({ success: true, message: 'Video deleted successfully' });
  } catch (err: any) {
    console.error('Failed to delete video:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete video' }, { status: 500 });
  }
}
