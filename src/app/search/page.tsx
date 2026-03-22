'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { searchContent } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import VideoCard from '@/components/home/VideoCard';
import { Search, VideoOff, Loader2, Users, CheckCircle2 } from 'lucide-react';
import type { Video, Channel } from '@/types';
import { formatViews, timeAgo, formatSubscribers } from '@/utils/formatters';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const [videoResults, setVideoResults] = useState<Video[]>([]);
  const [channelResults, setChannelResults] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync URL query into global store
  useEffect(() => {
    setSearchQuery(q);
  }, [q, setSearchQuery]);

  useEffect(() => {
    if (!q.trim()) {
      setVideoResults([]);
      setChannelResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchContent({ query: q }).then((data) => {
      if (!cancelled) {
        setVideoResults(data.videos);
        setChannelResults(data.channels);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [q]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
      </div>
    );
  }

  const totalResults = videoResults.length + channelResults.length;

  return (
    <div className="max-w-screen-xl mx-auto p-4 pb-16">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
        <Search className="w-5 h-5 text-text-muted" />
        <p className="text-text-secondary text-sm">
          {totalResults > 0
            ? <><span className="text-text-primary font-semibold">{totalResults}</span> results for &quot;<span className="text-text-primary font-semibold">{q}</span>&quot;</>
            : <>No results for &quot;<span className="text-text-primary font-semibold">{q}</span>&quot;</>}
        </p>
      </div>

      {totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-text-muted animate-fade-in">
          <VideoOff className="w-16 h-16 opacity-40" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm">Try different keywords or browse categories on the home page</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Channel Results */}
          {channelResults.length > 0 && (
            <div className="space-y-4 border-b border-border pb-8">
              {channelResults.map((channel) => (
                <ChannelSearchResultCard key={channel.id} channel={channel} />
              ))}
            </div>
          )}

          {/* Video Results */}
          <div className="space-y-4">
            {videoResults.map((video) => (
              <SearchResultCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelSearchResultCard({ channel }: { channel: Channel }) {
  return (
    <div className="flex items-center gap-4 sm:gap-16 py-4 animate-fade-in group">
      <Link href={`/channel/${channel.id}`} className="shrink-0 flex justify-center w-48 sm:w-64">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-surface-tertiary">
          <img
            src={channel.avatarUrl}
            alt={channel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/channel/${channel.id}`} className="flex items-center gap-1 hover:text-brand transition-colors">
          <h3 className="text-text-primary font-bold text-lg sm:text-xl truncate">
            {channel.name}
          </h3>
          {channel.verified && <CheckCircle2 className="w-4 h-4 text-text-muted" />}
        </Link>
        <div className="flex items-center gap-2 mt-1 text-text-muted text-sm">
          <span>@{channel.name.toLowerCase().replace(/\s+/g, '')}</span>
          <span>•</span>
          <span>{formatSubscribers(channel.subscribers)} subscribers</span>
        </div>
        {channel.bio && (
          <p className="text-text-muted text-sm mt-2 line-clamp-2 hidden sm:block max-w-2xl">
            {channel.bio}
          </p>
        )}
        <button className="mt-3 px-4 py-1.5 bg-text-primary text-surface-primary text-sm font-bold rounded-full hover:bg-text-secondary transition-colors">
          Subscribe
        </button>
      </div>
    </div>
  );
}

function SearchResultCard({ video }: { video: Video }) {
  return (
    <div className="flex gap-4 group animate-fade-in">
      {/* Thumbnail */}
      <a href={`/watch/${video.id}`} className="shrink-0 relative w-48 h-28 sm:w-64 sm:h-36 rounded-xl overflow-hidden bg-surface-tertiary">
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
      <div className="flex-1 min-w-0 py-1">
        <a href={`/watch/${video.id}`}>
          <h3 className="text-text-primary font-semibold text-base leading-snug line-clamp-2 hover:text-brand transition-colors">
            {video.title}
          </h3>
        </a>

        <div className="flex items-center gap-1.5 mt-1 text-text-muted text-xs">
          <span>{formatViews(video.views)} views</span>
          <span>·</span>
          <span className="capitalize">{video.category}</span>
        </div>

        {/* Channel row */}
        <div className="flex items-center gap-2 mt-2">
          <img
            src={video.channel.avatarUrl}
            alt={video.channel.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-text-muted text-xs">{video.channel.name}</span>
        </div>

        {/* Description snippet */}
        <p className="text-text-muted text-xs mt-2 line-clamp-2 hidden sm:block leading-relaxed">
          {video.description.slice(0, 150)}...
        </p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
