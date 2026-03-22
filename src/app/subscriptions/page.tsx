'use client';

import { useEffect, useState } from 'react';
import { getVideos } from '@/lib/api';
import VideoCard from '@/components/home/VideoCard';
import { Users } from 'lucide-react';
import type { Video } from '@/types';

export default function SubscriptionsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // In a real app, we'd fetch videos from subscribed channels
    // For now, let's just show all videos as a placeholder
    getVideos({ excludeShorts: true }).then((data) => {
      if (!cancelled) {
        setVideos(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-screen-2xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center">
            <Users className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Subscriptions</h1>
            <p className="text-text-muted text-sm mt-0.5">Latest from your favorite creators</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-1.5 text-sm font-medium text-brand hover:bg-brand/10 rounded-full transition-colors">
            Manage
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="w-full aspect-video bg-surface-tertiary rounded-xl"></div>
              <div className="flex gap-3 pr-6">
                <div className="w-9 h-9 rounded-full bg-surface-tertiary shrink-0"></div>
                <div className="flex flex-col gap-2 flex-1 pt-1">
                  <div className="h-4 bg-surface-tertiary rounded w-[90%]"></div>
                  <div className="h-3 bg-surface-tertiary rounded w-[60%]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-text-muted animate-fade-in text-center">
          <div className="w-20 h-20 rounded-full bg-surface-tertiary flex items-center justify-center mb-2">
            <Users className="w-10 h-10 opacity-40" />
          </div>
          <p className="text-lg font-medium">No videos yet</p>
          <p className="text-sm max-w-xs">Subscribe to channels to see their latest videos here.</p>
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
