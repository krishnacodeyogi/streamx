'use client';

import { useEffect, useRef } from 'react';
import { incrementView, trackWatchHistory } from '@/lib/api';
import { useStore } from '@/hooks/useStore';

export default function ViewTracker({ videoId }: { videoId: string }) {
  const tracked = useRef(false);
  const currentUser = useStore((s) => s.currentUser);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    (async () => {
      const views = await incrementView(videoId);
      
      // Track history if user is logged in
      if (currentUser?.id) {
        await trackWatchHistory(videoId, currentUser.id);
      }

      try {
        window.dispatchEvent(
          new CustomEvent('streamx:views-updated', {
            detail: { videoId, views },
          }),
        );
      } catch {}
    })();
  }, [videoId, currentUser?.id]);

  return null;
}
