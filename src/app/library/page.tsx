'use client';

import { useEffect, useState } from 'react';
import { getVideos } from '@/lib/api';
import VideoCard from '@/components/home/VideoCard';
import { History, PlaySquare, ThumbsUp, Clock, ChevronRight, LayoutDashboard } from 'lucide-react';
import type { Video } from '@/types';
import Link from 'next/link';

export default function LibraryPage() {
  const [history, setHistory] = useState<Video[]>([]);
  const [liked, setLiked] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getVideos({ limit: 4, excludeShorts: true }).then((data) => {
      if (!cancelled) {
        setHistory(data.slice(0, 4));
        setLiked(data.slice(1, 5));
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-screen-2xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10 border-b border-border pb-6">
        <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Library</h1>
          <p className="text-text-muted text-sm mt-0.5">Your personal dashboard</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* History Section */}
        <LibrarySection 
          title="History" 
          icon={<History className="w-5 h-5" />} 
          href="/history" 
          videos={history} 
          loading={loading} 
        />

        {/* Playlists Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlaySquare className="w-5 h-5 text-text-primary" />
              <h2 className="text-xl font-bold text-text-primary">Playlists</h2>
            </div>
            <Link href="/playlists" className="text-brand text-sm font-medium hover:underline flex items-center gap-1">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center h-40 bg-surface-tertiary/30 rounded-2xl border border-dashed border-border text-text-muted">
            <PlaySquare className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">No playlists created yet</p>
          </div>
        </div>

        {/* Watch Later Section */}
        <LibrarySection 
          title="Watch Later" 
          icon={<Clock className="w-5 h-5" />} 
          href="/watch-later" 
          videos={history.slice(0, 2)} // placeholder
          loading={loading} 
        />

        {/* Liked Videos Section */}
        <LibrarySection 
          title="Liked Videos" 
          icon={<ThumbsUp className="w-5 h-5" />} 
          href="/liked" 
          videos={liked} 
          loading={loading} 
        />
      </div>
    </div>
  );
}

function LibrarySection({ 
  title, 
  icon, 
  href, 
  videos, 
  loading 
}: { 
  title: string; 
  icon: React.ReactNode; 
  href: string; 
  videos: Video[]; 
  loading: boolean; 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-text-primary">{icon}</span>
          <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          <span className="text-text-muted text-sm font-normal ml-2">{videos.length}</span>
        </div>
        <Link href={href} className="text-brand text-sm font-medium hover:underline flex items-center gap-1">
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-video bg-surface-tertiary rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="py-8 text-text-muted text-sm italic">
          No videos found in this section.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} compact />
          ))}
        </div>
      )}
    </div>
  );
}
