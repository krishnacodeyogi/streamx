'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Bookmark,
  MoreHorizontal,
  Bell,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { formatViews, formatSubscribers, timeAgo } from '@/utils/formatters';
import { toggleLike, toggleSubscribe } from '@/lib/api';
import type { Video } from '@/types';
import { useStore } from '@/hooks/useStore';

interface VideoInfoProps {
  video: Video;
}

export default function VideoInfo({ video }: VideoInfoProps) {
  const currentUser = useStore((s) => s.currentUser);
  const [reaction, setReaction] = useState<'like' | 'dislike' | 'none'>('none');
  const [likes, setLikes] = useState(video.likes);
  const [dislikes, setDislikes] = useState(video.dislikes);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(video.channel.subscribers);
  const [descExpanded, setDescExpanded] = useState(false);
  const [viewCount, setViewCount] = useState(video.views);

  useEffect(() => {
    const handler = (e: Event) => {
      const anyEvent = e as CustomEvent<{ videoId: string; views: number }>;
      if (anyEvent.detail?.videoId === video.id) {
        setViewCount(anyEvent.detail.views);
      }
    };
    window.addEventListener('streamx:views-updated', handler);
    return () => {
      window.removeEventListener('streamx:views-updated', handler);
    };
  }, [video.id]);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please sign in to like videos');
      return;
    }
    const newReaction = reaction === 'like' ? 'none' : 'like';
    setReaction(newReaction);

    const result = await toggleLike(video.id, newReaction, currentUser.id);
    setLikes(result.likes);
    setDislikes(result.dislikes);
  };

  const handleDislike = async () => {
    if (!currentUser) {
      alert('Please sign in to dislike videos');
      return;
    }
    const newReaction = reaction === 'dislike' ? 'none' : 'dislike';
    setReaction(newReaction);

    const result = await toggleLike(video.id, newReaction, currentUser.id);
    setLikes(result.likes);
    setDislikes(result.dislikes);
  };

  const handleSubscribe = async () => {
    if (!currentUser) {
      alert('Please sign in to subscribe');
      return;
    }
    const willSubscribe = !subscribed;
    setSubscribed(willSubscribe);

    const newCount = await toggleSubscribe(
      video.channel.id,
      willSubscribe ? 'subscribe' : 'unsubscribe',
      currentUser.id
    );
    setSubscriberCount(newCount);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Title */}
      <h1 className="text-text-primary text-xl font-bold leading-tight">{video.title}</h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Channel info */}
        <div className="flex items-center gap-3">
          <Link href={`/channel/${video.channel.id}`} className="shrink-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-tertiary">
              <Image
                src={video.channel.avatarUrl}
                alt={video.channel.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          </Link>

          <div>
            <div className="flex items-center gap-1">
              <Link href={`/channel/${video.channel.id}`} className="text-text-primary text-sm font-semibold hover:text-brand transition-colors">
                {video.channel.name}
              </Link>
              {video.channel.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-text-muted" />
              )}
            </div>
            <p className="text-text-muted text-xs">{formatSubscribers(subscriberCount)}</p>
          </div>

          {/* Subscribe button */}
          <button
            onClick={handleSubscribe}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              subscribed
                ? 'bg-surface-tertiary text-text-secondary hover:bg-border'
                : 'bg-text-primary text-surface-primary hover:bg-text-secondary'
            }`}
          >
            {subscribed ? (
              <>
                <Bell className="w-4 h-4" />
                Subscribed
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Like/Dislike pill */}
          <div className="flex items-center rounded-full bg-surface-tertiary overflow-hidden">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors hover:bg-border border-r border-border ${
                reaction === 'like' ? 'text-brand' : 'text-text-primary'
              }`}
            >
              <ThumbsUp className="w-4 h-4" fill={reaction === 'like' ? 'currentColor' : 'none'} />
              <span>{formatViews(likes)}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors hover:bg-border ${
                reaction === 'dislike' ? 'text-brand' : 'text-text-primary'
              }`}
            >
              <ThumbsDown className="w-4 h-4" fill={reaction === 'dislike' ? 'currentColor' : 'none'} />
            </button>
          </div>

          <ActionBtn icon={<Share2 className="w-4 h-4" />} label="Share" />
          <ActionBtn icon={<Download className="w-4 h-4" />} label="Download" />
          <ActionBtn icon={<Bookmark className="w-4 h-4" />} label="Save" />
          <ActionBtn icon={<MoreHorizontal className="w-4 h-4" />} label="" />
        </div>
      </div>

      {/* Description box */}
      <div className="bg-surface-secondary rounded-xl p-4 space-y-2">
        {/* Stats row */}
        <div className="flex items-center gap-3 text-text-primary text-sm font-semibold">
          <span>{formatViews(viewCount)} views</span>
          <span className="text-text-muted font-normal">{timeAgo(video.uploadedAt)}</span>
          {video.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-blue-400 font-normal">#{tag}</span>
          ))}
        </div>

        {/* Description text */}
        <div className={`text-text-secondary text-sm leading-relaxed whitespace-pre-line ${!descExpanded ? 'line-clamp-3' : ''}`}>
          {video.description}
        </div>

        <button
          onClick={() => setDescExpanded((v) => !v)}
          className="flex items-center gap-1 text-text-primary text-sm font-semibold hover:text-brand transition-colors"
        >
          {descExpanded ? (
            <><ChevronUp className="w-4 h-4" /> Show less</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Show more</>
          )}
        </button>
      </div>
    </div>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 bg-surface-tertiary hover:bg-border text-text-primary px-4 py-2 rounded-full text-sm font-medium transition-colors">
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
}
