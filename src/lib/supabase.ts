import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth helpers ────────────────────────────────────────────────────────────

export const signUp = (email: string, password: string, name?: string) =>
  supabase.auth.signUp({
    email,
    password,
    options: name ? { data: { full_name: name } } : undefined,
  });

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  });

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// ─── Storage helpers (Supabase Storage) ──────────────────────────────────────

export async function uploadVideo(
  file: File,
  _userId: string,
  onProgress?: (progress: number) => void
) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `videos/${fileName}`;

  // Supabase storage bucket named 'media' or 'videos'. We'll assume 'media' bucket.
  const { data, error } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      // @ts-ignore - Some versions of supabase-js might not type this correctly yet, but it exists
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

export async function uploadThumbnail(blob: Blob, _userId: string) {
  const fileName = `thumb_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
  const filePath = `thumbnails/${fileName}`;

  const file = new File([blob], fileName, { type: 'image/jpeg' });

  const { data, error } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

export async function insertVideoMetadata(meta: {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  category: string;
  tags: string[];
  channel_id: string;
  is_short: boolean;
}) {
  const res = await fetch('/api/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meta),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to save video metadata');
  return json;
}
