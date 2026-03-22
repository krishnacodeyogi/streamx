'use client';

import { useEffect, useState } from 'react';
import { getVideos } from '@/lib/api';
import VideoCard from '@/components/home/VideoCard';
import { Flame, Loader2, TrendingUp } from 'lucide-react';
import type { Video } from '@/types';

export default function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getVideos({ sortBy: 'views', excludeShorts: true }).then((data) => {
      if (!cancelled) {
        setVideos(data.slice(0, 50)); // top 50
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
          <TrendingUp className="w-8 h-8 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Trending</h1>
          <p className="text-text-muted mt-1">Top viewed videos right now</p>
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
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-text-muted animate-fade-in">
          <Flame className="w-16 h-16 opacity-40" />
          <p className="text-lg font-medium">Nothing is trending</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">
          {videos.map((video, index) => (
            <div key={video.id} className="flex gap-4 sm:gap-6 group">
              {/* Rank Number */}
              <div className="hidden sm:flex shrink-0 w-8 items-center justify-center text-text-muted font-bold text-2xl">
                #{index + 1}
              </div>
              <div className="flex-1">
                <TrendingCard video={video} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingCard({ video }: { video: Video }) {
  return (
    <div className="flex gap-4 group animate-fade-in w-full">
      {/* Thumbnail */}
      <a href={`/watch/${video.id}`} className="shrink-0 relative w-40 h-24 sm:w-64 sm:h-36 rounded-xl overflow-hidden bg-surface-tertiary">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {video.duration}
        </span>
      </a>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-center sm:justify-start">
        <a href={`/watch/${video.id}`}>
          <h3 className="text-text-primary font-semibold text-sm sm:text-lg leading-snug line-clamp-2 hover:text-brand transition-colors">
            {video.title}
          </h3>
        </a>

        {/* Desktop view stats inline with channel */}
        <div className="hidden sm:flex items-center gap-2 mt-2">
          <a href={`/channel/${video.channel.id}`} className="flex items-center gap-2 group/chan">
            <img src={video.channel.avatarUrl} alt={video.channel.name} className="w-6 h-6 rounded-full" />
            <span className="text-text-muted text-xs hover:text-text-primary transition-colors">{video.channel.name}</span>
          </a>
          <span className="text-text-muted text-xs">•</span>
          <span className="text-text-muted text-xs">{video.views.toLocaleString()} views</span>
        </div>

        {/* Mobile view stats */}
        <div className="sm:hidden flex flex-col gap-1 mt-1 text-text-muted text-xs">
          <span>{video.channel.name}</span>
          <span>{video.views.toLocaleString()} views</span>
        </div>

        {/* Description snippet */}
        <p className="text-text-muted text-xs mt-3 line-clamp-2 hidden sm:block leading-relaxed">
          {video.description.slice(0, 150)}...
        </p>
      </div>
    </div>
  );
}
