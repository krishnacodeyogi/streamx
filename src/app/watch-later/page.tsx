'use client';

import { useEffect, useState } from 'react';
import { getVideos } from '@/lib/api';
import VideoCard from '@/components/home/VideoCard';
import { Clock } from 'lucide-react';
import type { Video } from '@/types';

export default function WatchLaterPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Placeholder
    getVideos({ excludeShorts: true }).then((data) => {
      if (!cancelled) {
        setVideos(data.slice(2, 6)); // some different videos
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-screen-2xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
        <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center">
          <Clock className="w-8 h-8 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Watch Later</h1>
          <p className="text-text-muted mt-1">Videos you've saved to watch later</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
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
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-text-muted animate-fade-in">
          <Clock className="w-16 h-16 opacity-40" />
          <p className="text-lg font-medium">Your list is empty</p>
          <p className="text-sm">Save videos to watch them later.</p>
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
