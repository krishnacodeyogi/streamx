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

// POST /api/channels/[id]/subscribe — toggle subscribe (One per user)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action, userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const channels = await readChannels();
    const targetChannel = channels[params.id];
    
    if (!targetChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Initialize subscriber list if it doesn't exist
    if (!targetChannel.subscriber_ids) {
      targetChannel.subscriber_ids = [];
    }

    const alreadySubscribed = targetChannel.subscriber_ids.includes(userId);

    if (action === 'subscribe') {
      if (!alreadySubscribed) {
        targetChannel.subscriber_ids.push(userId);
      }
    } else if (action === 'unsubscribe') {
      targetChannel.subscriber_ids = targetChannel.subscriber_ids.filter((id: string) => id !== userId);
    }

    // Update the count based on array length
    targetChannel.subscribers = targetChannel.subscriber_ids.length;
    
    await writeChannels(channels);

    return NextResponse.json({ 
      subscribers: targetChannel.subscribers,
      isSubscribed: action === 'subscribe'
    });
  } catch (err: any) {
    console.error('Failed to toggle subscribe:', err);
    return NextResponse.json({ error: 'Failed to toggle subscribe' }, { status: 500 });
  }
}
