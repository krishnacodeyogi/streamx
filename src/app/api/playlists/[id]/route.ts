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

// GET /api/playlists/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playlists = await readPlaylists();
    const playlist = playlists[id];

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json(playlist);
  } catch (err: any) {
    console.error('Failed to fetch playlist:', err);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}

// PATCH /api/playlists/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const playlists = await readPlaylists();
    
    if (!playlists[id]) {
       return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const updated: Playlist = {
      ...playlists[id],
      name: body.name ?? playlists[id].name,
      description: body.description ?? playlists[id].description,
      isPrivate: body.isPrivate ?? playlists[id].isPrivate,
      videoIds: body.videoIds ?? playlists[id].videoIds,
    };

    playlists[id] = updated;
    await writePlaylists(playlists);

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Failed to update playlist:', err);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}

// DELETE /api/playlists/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playlists = await readPlaylists();
    
    if (!playlists[id]) {
       return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    delete playlists[id];
    await writePlaylists(playlists);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to delete playlist:', err);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
