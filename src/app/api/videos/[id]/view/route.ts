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

// POST /api/videos/[id]/view — increment views
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const videos = await readDB();
    const index = (videos as any[]).findIndex((v) => v.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const views = (videos[index].views ?? 0) + 1;
    videos[index].views = views;
    
    await writeDB(videos);

    return NextResponse.json({ views });
  } catch (err: any) {
    console.error('Failed to increment views:', err);
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
}
