import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { Playlist } from '@/types';

const PLAYLISTS_PATH = path.join(process.cwd(), 'data', 'playlists.json');

async function readPlaylists(): Promise<Record<string, Playlist>> {
  try {
    const data = await readFile(PLAYLISTS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writePlaylists(data: Record<string, Playlist>) {
  await writeFile(PLAYLISTS_PATH, JSON.stringify(data, null, 2));
}

// GET /api/playlists?userId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const playlistsMap = await readPlaylists();
    const userPlaylists = Object.values(playlistsMap).filter(
      (p) => p.userId === userId
    );

    return NextResponse.json(userPlaylists);
  } catch (err: any) {
    console.error('Failed to fetch playlists:', err);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

// POST /api/playlists
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, userId, isPrivate } = body;

    if (!name || !userId) {
      return NextResponse.json({ error: 'Name and User ID are required' }, { status: 400 });
    }

    const playlists = await readPlaylists();
    const newId = `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newPlaylist: Playlist = {
      id: newId,
      name,
      description: description || '',
      userId,
      videoIds: [],
      isPrivate: isPrivate ?? false,
      createdAt: new Date().toISOString(),
    };

    playlists[newId] = newPlaylist;
    await writePlaylists(playlists);

    return NextResponse.json(newPlaylist);
  } catch (err: any) {
    console.error('Failed to create playlist:', err);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
