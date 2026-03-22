/**
 * API layer — fetches data from local API routes.
 */

import { supabase } from '@/lib/supabase';
import type { Video, Channel, Comment, SearchFilters } from '@/types';

// Detect API base URL for server-side fetches
// In development, port might change (3000, 3001, 3002, 3005, etc.)
const PORT = process.env.PORT || 3005; // Explicitly using 3005 as we just started the server on it
const API_BASE = typeof window !== 'undefined' ? '' : `http://localhost:${PORT}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map a row (with joined channel) to our Video type */
function mapVideo(row: any): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    thumbnailUrl: row.thumbnail_url ?? '',
    videoUrl: row.video_url ?? '',
    duration: row.duration ?? '',
    views: row.views ?? 0,
    likes: row.likes ?? 0,
    dislikes: row.dislikes ?? 0,
    uploadedAt: row.uploaded_at ?? row.created_at,
    category: row.category,
    tags: row.tags ?? [],
    channel: row.channels
      ? {
          id: row.channels.id,
          name: row.channels.name,
          avatarUrl: row.channels.avatar_url ?? row.channels.avatarUrl ?? '',
          subscribers: row.channels.subscribers ?? 0,
          verified: row.channels.verified ?? false,
        }
      : row.channel ?? { id: '', name: 'Unknown User', avatarUrl: '', subscribers: 0, verified: false },
    isShort: row.is_short ?? false,
  };
}

/** Map a comment row to our Comment type */
function mapComment(row: any, replies: Comment[] = []): Comment {
  return {
    id: row.id,
    videoId: row.video_id,
    author: {
      id: row.author_id ?? '',
      name: row.author_name ?? 'Anonymous',
      avatarUrl: row.author_avatar ?? '',
    },
    content: row.content,
    likes: row.likes ?? 0,
    createdAt: row.created_at,
    replies: replies.length > 0 ? replies : undefined,
  };
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export interface ExtendedSearchFilters extends Partial<SearchFilters> {
  channelId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResults {
  videos: Video[];
  channels: Channel[];
}

export async function searchContent(filters: ExtendedSearchFilters): Promise<SearchResults> {
  try {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters?.query) params.set('q', filters.query);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.shortsOnly) params.set('shortsOnly', 'true');
    if (filters?.excludeShorts) params.set('excludeShorts', 'true');
    if (filters?.channelId) params.set('channelId', filters.channelId);
    if (filters?.limit) params.set('limit', filters.limit.toString());
    if (filters?.offset) params.set('offset', filters.offset.toString());

    const url = `${API_BASE}/api/videos?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Fetch failed (${res.status}): ${url}`);
      throw new Error(`Failed to fetch search results: ${res.status}`);
    }
    const data = await res.json();
    
    // Handle both old array format and new object format
    const videoData = Array.isArray(data) ? data : (data.videos ?? []);
    const channelData = Array.isArray(data) ? [] : (data.channels ?? []);

    return {
      videos: videoData.map(mapVideo),
      channels: channelData.map((c: any) => ({
        id: c.id,
        name: c.name,
        avatarUrl: c.avatar_url ?? '',
        bannerUrl: c.banner_url ?? '',
        bio: c.bio ?? '',
        subscribers: c.subscribers ?? 0,
        verified: c.verified ?? false,
      })),
    };
  } catch (err) {
    console.error('Failed to fetch search results:', err);
    return { videos: [], channels: [] };
  }
}

export async function getVideos(filters?: ExtendedSearchFilters): Promise<Video[]> {
  try {
    const results = await searchContent(filters || {});
    return results.videos;
  } catch (err) {
    console.error('Failed to fetch videos:', err);
    return [];
  }
}

export async function getVideoById(id: string): Promise<Video | null> {
  try {
    const res = await fetch(`${API_BASE}/api/videos/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data ? mapVideo(data) : null;
  } catch (err) {
    console.error('Failed to fetch video:', err);
    return null;
  }
}

export async function getRelatedVideos(videoId: string, category: string): Promise<Video[]> {
  try {
    const params = new URLSearchParams({ category, excludeId: videoId, limit: '10' });
    const res = await fetch(`${API_BASE}/api/videos?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch related videos');
    const data = await res.json();
    
    // Handle both old array format and new object format
    const videoData = Array.isArray(data) ? data : (data.videos ?? []);
    return videoData.map(mapVideo);
  } catch (err) {
    console.error('Failed to fetch related videos:', err);
    return [];
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(videoId: string): Promise<Comment[]> {
  try {
    const res = await fetch(`${API_BASE}/api/comments?videoId=${videoId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch comments');
    const data = await res.json();

    if (data && data.length > 0) {
      const topLevel = data.filter((c: any) => !c.parent_id);
      const replies = data.filter((c: any) => c.parent_id);

      return topLevel.map((c: any) => {
        const childReplies = replies
          .filter((r: any) => r.parent_id === c.id)
          .map((r: any) => mapComment(r));
        return mapComment(c, childReplies);
      });
    }

    return [];
  } catch (err) {
    console.error('Failed to fetch comments:', err);
    return [];
  }
}

export async function postComment(videoId: string, content: string, userId: string): Promise<Comment> {
  const localComment = {
    id: `c_${Date.now()}`,
    video_id: videoId,
    author_id: userId,
    author_name: 'You',
    author_avatar: 'https://picsum.photos/seed/me/40/40',
    content,
  };

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localComment),
    });
    if (!res.ok) throw new Error('Failed to post comment');
    const data = await res.json();
    return mapComment(data);
  } catch (err) {
    console.error('Failed to post comment:', err);
    // Fallback to optimistic UI
    return mapComment({
      ...localComment,
      created_at: new Date().toISOString(),
      likes: 0,
    });
  }
}

// ─── Channels ─────────────────────────────────────────────────────────────────

export async function getChannel(channelId: string): Promise<Channel | null> {
  try {
    const url = `${API_BASE}/api/channels/${channelId}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.warn(`Channel fetch failed (${res.status}): ${url}`);
      return null;
    }
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.avatar_url ?? '',
      bannerUrl: data.banner_url ?? '',
      bio: data.bio ?? '',
      subscribers: data.subscribers ?? 0,
      verified: data.verified ?? false,
    };
  } catch (err) {
    console.error(`Failed to fetch channel at ${API_BASE}:`, err);
    return null;
  }
}

export async function updateChannel(channelId: string, data: {
  name?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
}): Promise<Channel> {
  const res = await fetch(`/api/channels/${channelId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update channel');
  }

  const json = await res.json();
  return {
    id: json.id,
    name: json.name,
    avatarUrl: json.avatar_url ?? '',
    bannerUrl: json.banner_url ?? '',
    bio: json.bio ?? '',
    subscribers: json.subscribers ?? 0,
    verified: json.verified ?? false,
  };
}

// ─── Video Upload (local server) ─────────────────────────────────────────────

export async function uploadVideoLocal(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'video');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload video');
  }

  const data = await res.json();
  return data.url;
}

export async function uploadThumbnailLocal(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, 'thumbnail.jpg');
  formData.append('type', 'thumbnail');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload thumbnail');
  }

  const data = await res.json();
  return data.url;
}

export async function saveVideoMetadataLocal(meta: {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  category: string;
  tags: string[];
  channel_id: string;
  channel_name?: string;
  channel_avatar_url?: string;
  is_short: boolean;
}): Promise<Video> {
  const res = await fetch('/api/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to save video metadata');
  }

  const data = await res.json();
  return mapVideo(data);
}

// ─── Video Actions (client-side) ─────────────────────────────────────────────

export async function incrementView(videoId: string): Promise<number> {
  try {
    const res = await fetch(`/api/videos/${videoId}/view`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to increment view');
    const data = await res.json();
    return data.views;
  } catch (err) {
    console.error('Failed to increment view:', err);
    return 0;
  }
}

export async function toggleLike(
  videoId: string,
  action: 'like' | 'dislike' | 'none',
  userId: string,
): Promise<{ likes: number; dislikes: number; userReaction: string }> {
  try {
    const res = await fetch(`/api/videos/${videoId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId }),
    });
    if (!res.ok) throw new Error('Failed to toggle like');
    return await res.json();
  } catch (err) {
    console.error('Failed to toggle like:', err);
    return { likes: 0, dislikes: 0, userReaction: 'none' };
  }
}

export async function toggleSubscribe(
  channelId: string,
  action: 'subscribe' | 'unsubscribe',
  userId: string,
): Promise<number> {
  try {
    const res = await fetch(`/api/channels/${channelId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId }),
    });
    if (!res.ok) throw new Error('Failed to toggle subscribe');
    const data = await res.json();
    return data.subscribers;
  } catch (err) {
    console.error('Failed to toggle subscribe:', err);
    return 0;
  }
}

// ─── History & Watch Later ───────────────────────────────────────────────────

export async function trackWatchHistory(videoId: string, userId: string): Promise<void> {
  try {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, userId }),
    });
  } catch (err) {
    console.error('Failed to track history:', err);
  }
}

export async function getWatchHistory(userId: string): Promise<Video[]> {
  try {
    const res = await fetch(`/api/history?userId=${userId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch history');
    const data = await res.json();
    return (data ?? []).map(mapVideo);
  } catch (err) {
    console.error('Failed to fetch history:', err);
    return [];
  }
}

export async function deleteVideo(videoId: string, userId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/videos/${videoId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete video');
    }
    return true;
  } catch (err) {
    console.error('Failed to delete video:', err);
    throw err;
  }
}
