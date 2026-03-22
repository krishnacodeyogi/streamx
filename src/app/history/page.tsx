'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { getWatchHistory } from '@/lib/api';
import VideoCard from '@/components/home/VideoCard';
import { History, Loader2 } from 'lucide-react';
import type { Video } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const currentUser = useStore((s) => s.currentUser);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }

    let cancelled = false;
    setLoading(true);

    getWatchHistory(currentUser.id).then((data) => {
      if (!cancelled) {
        setVideos(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-screen-2xl mx-auto pb-16">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-8 h-8 text-brand" />
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Watch History</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-text-muted animate-fade-in bg-surface-secondary rounded-2xl border border-border">
          <History className="w-16 h-16 opacity-40" />
          <p className="text-lg font-medium">No watch history</p>
          <p className="text-sm">Videos you watch will show up here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
