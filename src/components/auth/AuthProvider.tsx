'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/hooks/useStore';
import { getChannel } from '@/lib/api';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';

function mapSupabaseUser(su: SupabaseUser): User {
  const meta = su.user_metadata ?? {};
  const name =
    meta.full_name || meta.name || meta.display_name || su.email?.split('@')[0] || 'User';
  const avatarUrl = meta.avatar_url || meta.picture || '';

  return {
    id: su.id,
    email: su.email || '',
    name,
    avatarUrl,
    subscribers: 0,
    subscriptions: [],
    likedVideos: [],
    watchHistory: [],
    createdAt: su.created_at || new Date().toISOString(),
  };
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setCurrentUser = useStore((s) => s.setCurrentUser);

  const syncUser = useCallback(async (su: SupabaseUser | null) => {
    if (!su) {
      setCurrentUser(null);
      return;
    }

    const baseUser = mapSupabaseUser(su);

    try {
      // Fetch latest profile from our local DB/API
      const channel = await getChannel(su.id);
      if (channel) {
        // Merge Supabase Auth info with local profile data
        setCurrentUser({
          ...baseUser,
          name: channel.name || baseUser.name,
          avatarUrl: channel.avatarUrl || baseUser.avatarUrl,
          bannerUrl: channel.bannerUrl,
          bio: channel.bio,
          subscribers: channel.subscribers,
        });
      } else {
        setCurrentUser(baseUser);
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
      setCurrentUser(baseUser);
    }
  }, [setCurrentUser]);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session?.user || null);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [syncUser]);

  return <>{children}</>;
}
