'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useStore } from '@/hooks/useStore';
import { getVideos } from '@/lib/api';
import VideoCard from './VideoCard';
import { VideoOff, Loader2 } from 'lucide-react';
import type { Video } from '@/types';

const PAGE_SIZE = 12;

export default function VideoGrid() {
  const activeCategory = useStore((s) => s.activeCategory);
  const searchQuery = useStore((s) => s.searchQuery);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset when category or search changes
  useEffect(() => {
    setVideos([]);
    setPage(0);
    setHasMore(true);
  }, [activeCategory, searchQuery]);

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getVideos({
      category: activeCategory,
      query: searchQuery.trim() || undefined,
      excludeShorts: true,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }).then((data) => {
      if (!cancelled) {
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
        setVideos((prev) => page === 0 ? data : [...prev, ...data]);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [activeCategory, searchQuery, page]);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, loading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  if (loading && page === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 p-4 pb-16">
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
    );
  }

  if (videos.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-text-muted animate-fade-in">
        <VideoOff className="w-16 h-16 opacity-40" />
        <p className="text-lg font-medium">No videos found</p>
        <p className="text-sm">Try a different category or search term</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      
      {/* Infinite Scroll Target */}
      <div ref={observerTarget} className="w-full h-20 flex items-center justify-center mt-8">
        {loading && page > 0 && (
          <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
        )}
      </div>
    </div>
  );
}
