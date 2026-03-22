import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const CHANNELS_PATH = path.join(process.cwd(), 'data', 'channels.json');

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

// GET /api/channels/[id] — get channel details
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const channels = await readChannels();
    let channel = channels[params.id];

    if (!channel) {
      // Return a default channel object for users without a profile yet
      // This prevents 404 on the channel page
      channel = {
        id: params.id,
        name: 'New User',
        avatar_url: '',
        subscribers: 0,
        verified: false,
      };
    }

    return NextResponse.json(channel);
  } catch (err: any) {
    console.error('Failed to fetch channel:', err);
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 });
  }
}

// PATCH /api/channels/[id] — update profile details
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const channels = await readChannels();
    
    if (!channels[params.id]) {
      // Create if not exists (for new users)
      channels[params.id] = {
        id: params.id,
        name: 'New User',
        avatar_url: '',
        subscribers: 0,
        verified: false,
      };
    }

    const updated = {
      ...channels[params.id],
      name: body.name ?? channels[params.id].name,
      avatar_url: body.avatarUrl ?? channels[params.id].avatar_url,
      banner_url: body.bannerUrl ?? channels[params.id].banner_url,
      bio: body.bio ?? channels[params.id].bio,
    };

    channels[params.id] = updated;
    await writeChannels(channels);

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Failed to update channel:', err);
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
  }
}
