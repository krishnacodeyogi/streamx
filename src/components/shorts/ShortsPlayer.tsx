'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreVertical,
  Play,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { formatViews } from '@/utils/formatters';
import { incrementView, toggleLike, toggleSubscribe, deleteVideo } from '@/lib/api';
import type { Video } from '@/types';
import { useStore } from '@/hooks/useStore';

interface ShortsPlayerProps {
  videos: Video[];
}

export default function ShortsPlayer({ videos }: ShortsPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which short is visible using IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: 0.6 },
    );

    const items = container.querySelectorAll('[data-index]');
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [videos]);

  const scrollTo = (index: number) => {
    const container = containerRef.current;
    if (!container || index < 0 || index >= videos.length) return;
    const target = container.children[index] as HTMLElement;
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="text-center">
          <p className="text-text-muted text-lg">No Shorts available</p>
          <p className="text-text-muted text-sm mt-1">Upload some videos to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-start justify-center h-[calc(100vh-3.5rem)]">
      {/* Scrollable shorts feed */}
      <div
        ref={containerRef}
        className="h-full snap-y snap-mandatory overflow-y-scroll scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {videos.map((video, index) => (
          <ShortCard
            key={video.id}
            video={video}
            index={index}
            isActive={activeIndex === index}
          />
        ))}
      </div>

      {/* Navigation arrows - right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20 hidden sm:flex">
        <button
          onClick={() => scrollTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="w-10 h-10 bg-surface-tertiary hover:bg-border rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous short"
        >
          <ChevronUp className="w-5 h-5 text-text-primary" />
        </button>
        <button
          onClick={() => scrollTo(activeIndex + 1)}
          disabled={activeIndex === videos.length - 1}
          className="w-10 h-10 bg-surface-tertiary hover:bg-border rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next short"
        >
          <ChevronDown className="w-5 h-5 text-text-primary" />
        </button>
      </div>
    </div>
  );
}

/* ─── Individual Short Card ──────────────────────────────────────────────────── */

function ShortCard({
  video,
  index,
  isActive,
}: {
  video: Video;
  index: number;
  isActive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewTracked = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showDesc, setShowDesc] = useState(false);
  const currentUser = useStore((s) => s.currentUser);
  const isOwner = currentUser?.id === video.channel.id;

  // Server-synced state
  const [likeCount, setLikeCount] = useState(video.likes);
  const [reaction, setReaction] = useState<'like' | 'dislike' | 'none'>('none');
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(video.channel.subscribers);
  const [avatarError, setAvatarError] = useState(false);

  const avatarUrl = video.channel.avatarUrl || `https://picsum.photos/seed/${video.channel.id}/64/64`;

  // Auto-play/pause based on visibility + track view
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false));

      // Track view once when this short becomes active
      if (!viewTracked.current) {
        viewTracked.current = true;
        incrementView(video.id);
      }
    } else {
      vid.pause();
      vid.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive, video.id]);

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (playing) {
      vid.pause();
      setPlaying(false);
    } else {
      vid.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  }, []);

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    setProgress((vid.currentTime / vid.duration) * 100);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please sign in to like videos');
      return;
    }
    const newReaction = reaction === 'like' ? 'none' : 'like';
    setReaction(newReaction);
    const result = await toggleLike(video.id, newReaction, currentUser.id);
    setLikeCount(result.likes);
  };

  const handleDislike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please sign in to dislike videos');
      return;
    }
    const newReaction = reaction === 'dislike' ? 'none' : 'dislike';
    setReaction(newReaction);
    await toggleLike(video.id, newReaction, currentUser.id);
  };

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    setSubCount(newCount);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.id) return;
    if (!confirm('Are you sure you want to delete this Short? This action cannot be undone.')) return;

    try {
      await deleteVideo(video.id, currentUser.id);
      alert('Short deleted successfully');
      window.location.reload(); // Refresh to update list
    } catch (err: any) {
      alert(err.message || 'Failed to delete short');
    }
  };

  return (
    <div
      data-index={index}
      className="snap-start h-[calc(100vh-3.5rem)] flex items-center justify-center py-2"
    >
      <div className="relative h-full max-h-[calc(100vh-4.5rem)] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl group">
        {/* Video */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          className="w-full h-full object-cover"
          loop
          muted={muted}
          playsInline
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          preload="metadata"
        />

        {/* Play/Pause center icon (shown briefly on tap) */}
        {!playing && isActive && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/10"
          >
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </button>
        )}

        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div
            className="h-full bg-brand transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mute/Unmute button - top right */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors z-10"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Right-side action buttons */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-10">
          <ActionButton
            icon={<ThumbsUp className="w-6 h-6" fill={reaction === 'like' ? 'currentColor' : 'none'} />}
            label={formatViews(likeCount)}
            onClick={handleLike}
            active={reaction === 'like'}
          />
          <ActionButton
            icon={<ThumbsDown className="w-6 h-6" fill={reaction === 'dislike' ? 'currentColor' : 'none'} />}
            label="Dislike"
            onClick={handleDislike}
            active={reaction === 'dislike'}
          />
          <ActionButton
            icon={<MessageCircle className="w-6 h-6" />}
            label="0"
          />
          <ActionButton
            icon={<Share2 className="w-6 h-6" />}
            label="Share"
          />
          {isOwner && (
            <ActionButton
              icon={<Trash2 className="w-6 h-6" />}
              label="Delete"
              onClick={handleDelete}
            />
          )}
          <ActionButton
            icon={<MoreVertical className="w-6 h-6" />}
            label=""
          />

          {/* Channel avatar */}
          <div className="relative">
            <img
              src={avatarError ? `https://picsum.photos/seed/${video.channel.id}/64/64` : avatarUrl}
              alt={video.channel.name}
              className="w-9 h-9 rounded-full border-2 border-white object-cover"
              onError={() => setAvatarError(true)}
            />
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-2 left-0 right-14 p-4 z-10">
          {/* Channel name */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-semibold text-sm">
              @{video.channel.name.replace(/\s+/g, '').toLowerCase()}
            </span>
            {video.channel.verified && (
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
              </svg>
            )}
            <button
              onClick={handleSubscribe}
              className={`ml-1 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                subscribed
                  ? 'bg-white/30 text-white hover:bg-white/40'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Title / Description */}
          <div
            className="cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setShowDesc(!showDesc); }}
          >
            <p className={`text-white text-sm ${showDesc ? '' : 'line-clamp-2'}`}>
              {video.title}
              {video.description && ` — ${video.description}`}
            </p>
          </div>

          {/* Category tag */}
          {video.category && video.category !== 'All' && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
              #{video.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Action Button ──────────────────────────────────────────────────────────── */

function ActionButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group/action">
      <div className={`hover:text-brand transition-colors group-active/action:scale-90 ${active ? 'text-brand' : 'text-white'}`}>
        {icon}
      </div>
      {label && (
        <span className="text-white text-xs font-medium">{label}</span>
      )}
    </button>
  );
}
