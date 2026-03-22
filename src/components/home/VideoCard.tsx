'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreVertical, Clock, BookmarkPlus, Trash2 } from 'lucide-react';
import { formatViews, timeAgo } from '@/utils/formatters';
import type { Video } from '@/types';
import { useStore } from '@/hooks/useStore';
import { deleteVideo } from '@/lib/api';

interface VideoCardProps {
  video: Video;
  /** compact = small card for related videos panel */
  compact?: boolean;
  /** hideChannel = hide channel avatar and name (e.g. on channel page) */
  hideChannel?: boolean;
}

export default function VideoCard({ video, compact = false, hideChannel = false }: VideoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const currentUser = useStore((s) => s.currentUser);

  const isOwner = currentUser?.id === video.channel.id;

  const thumbnailUrl = video.thumbnailUrl || `https://picsum.photos/seed/${video.id}/640/360`;
  const avatarUrl = video.channel.avatarUrl || `https://picsum.photos/seed/${video.channel.id}/64/64`;

  const handleDelete = async () => {
    if (!currentUser?.id) return;
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;

    try {
      await deleteVideo(video.id, currentUser.id);
      alert('Video deleted successfully');
      window.location.reload(); // Refresh to update list
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    }
  };

  if (compact) {
    return (
      <Link href={`/watch/${video.id}`} className="flex gap-2 group animate-fade-in">
        {/* Thumbnail */}
        <div className="relative shrink-0 w-40 h-24 rounded-xl overflow-hidden bg-surface-tertiary">
          <Image
            src={imgError ? `https://picsum.photos/seed/${video.id}/320/180` : thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            sizes="160px"
          />
          <DurationBadge duration={video.duration} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          <h3 className="text-text-primary text-sm font-medium line-clamp-2 leading-snug group-hover:text-brand transition-colors">
            {video.title}
          </h3>
          <p className="text-text-muted text-xs mt-1">{video.channel.name}</p>
          <p className="text-text-muted text-xs">
            {formatViews(video.views)} views · {timeAgo(video.uploadedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <article className="group animate-fade-in">
      {/* Thumbnail */}
      <Link href={`/watch/${video.id}`} className="block relative aspect-video rounded-xl overflow-hidden bg-surface-tertiary">
        <Image
          src={imgError ? `https://picsum.photos/seed/${video.id}/640/360` : thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <DurationBadge duration={video.duration} />

        {/* Hover overlay buttons */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2 gap-1">
          <ActionPill icon={<Clock className="w-3.5 h-3.5" />} label="Watch Later" />
          <ActionPill icon={<BookmarkPlus className="w-3.5 h-3.5" />} label="Save" />
        </div>
      </Link>

      {/* Video meta */}
      <div className="flex gap-3 mt-3">
        {/* Channel avatar */}
        {!hideChannel && (
          <Link href={`/channel/${video.channel.id}`} className="shrink-0 mt-0.5">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-surface-tertiary">
              <Image
                src={avatarError ? `https://picsum.photos/seed/${video.channel.id}/64/64` : avatarUrl}
                alt={video.channel.name}
                fill
                className="object-cover"
                onError={() => setAvatarError(true)}
                sizes="36px"
              />
            </div>
          </Link>
        )}

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <Link href={`/watch/${video.id}`}>
              <h3 className="text-text-primary text-sm font-medium line-clamp-2 leading-snug hover:text-brand transition-colors">
                {video.title}
              </h3>
            </Link>

            {/* Kebab menu */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-surface-tertiary transition-all"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 text-text-secondary" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-8 w-48 bg-surface-elevated border border-border rounded-xl shadow-2xl py-1 z-20 animate-fade-in"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors">
                    Add to queue
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors">
                    Save to Watch Later
                  </button>
                  {isOwner && (
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Video
                    </button>
                  )}
                  <button className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors">
                    Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {!hideChannel && (
            <Link href={`/channel/${video.channel.id}`} className="flex items-center gap-1 mt-1 group/chan">
              <span className="text-text-muted text-xs hover:text-text-secondary transition-colors">
                {video.channel.name}
              </span>
              {video.channel.verified && (
                <svg className="w-3.5 h-3.5 text-text-muted shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
                </svg>
              )}
            </Link>
          )}

          <p className="text-text-muted text-xs mt-1">
            {formatViews(video.views)} views · {timeAgo(video.uploadedAt)}
          </p>
        </div>
      </div>
    </article>
  );
}

function DurationBadge({ duration }: { duration: string }) {
  return (
    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
      {duration}
    </span>
  );
}

function ActionPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      className="flex items-center gap-1 bg-black/80 hover:bg-black text-white text-xs px-2 py-1 rounded-full transition-colors"
      onClick={(e) => e.preventDefault()}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
