import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const COMMENTS_PATH = path.join(process.cwd(), 'data', 'comments.json');

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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const videoId = searchParams.get('videoId');
  
  if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  
  const comments = await readComments();
  const filtered = comments.filter((c: any) => c.video_id === videoId);
  
  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const comments = await readComments();
    
    const newComment = {
      id: body.id || `c_${Date.now()}`,
      video_id: body.video_id,
      author_id: body.author_id,
      author_name: body.author_name,
      author_avatar: body.author_avatar,
      content: body.content,
      likes: 0,
      created_at: new Date().toISOString(),
    };
    
    comments.push(newComment);
    await writeComments(comments);
    
    return NextResponse.json(newComment);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to post comment' }, { status: 500 });
  }
}
