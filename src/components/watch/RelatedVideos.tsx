'use client';

import { useEffect, useState } from 'react';
import { getRelatedVideos } from '@/lib/api';
import VideoCard from '@/components/home/VideoCard';
import type { Video } from '@/types';

interface RelatedVideosProps {
  currentVideoId: string;
  category: string;
}

function SkeletonCard() {
  return (
    <div className="flex gap-2 animate-pulse">
      <div className="shrink-0 w-40 h-24 rounded-lg bg-surface-tertiary" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-surface-tertiary rounded w-full" />
        <div className="h-3 bg-surface-tertiary rounded w-3/4" />
        <div className="h-2 bg-surface-tertiary rounded w-1/2 mt-2" />
      </div>
    </div>
  );
}

export default function RelatedVideos({ currentVideoId, category }: RelatedVideosProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getRelatedVideos(currentVideoId, category).then((data) => {
      if (!cancelled) {
        setVideos(data);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [currentVideoId, category]);

  return (
    <aside className="space-y-3">
      <h2 className="text-text-primary font-semibold text-base">Up Next</h2>
      {loading ? (
        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
      ) : videos.length === 0 ? (
        <p className="text-text-muted text-sm">No related videos found</p>
      ) : (
        videos.map((video) => (
          <VideoCard key={video.id} video={video} compact />
        ))
      )}
    </aside>
  );
}
