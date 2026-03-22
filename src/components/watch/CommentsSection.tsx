'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Reply } from 'lucide-react';
import { timeAgo, formatViews } from '@/utils/formatters';
import type { Comment } from '@/types';
import { supabase } from '@/lib/supabase';
import { postComment } from '@/lib/api';
import { useStore } from '@/hooks/useStore';

interface CommentsSectionProps {
  videoId: string;
  comments: Comment[];
  totalCount: number;
}

export default function CommentsSection({ videoId, comments, totalCount }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [focused, setFocused] = useState(false);
  const [sortBy, setSortBy] = useState<'top' | 'new'>('top');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const currentUser = useStore((s) => s.currentUser);

  useEffect(() => {
    // Setup Supabase Realtime subscription
    const channel = supabase
      .channel(`public:comments:video_id=eq.${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          const newRow = payload.new as any;
          const newC: Comment = {
            id: newRow.id,
            videoId: newRow.video_id,
            author: {
              id: newRow.author_id ?? 'unknown',
              name: newRow.author_name ?? 'Anonymous',
              avatarUrl: newRow.author_avatar ?? 'https://picsum.photos/seed/default/40/40',
            },
            content: newRow.content,
            likes: newRow.likes ?? 0,
            createdAt: newRow.created_at,
          };

          setLocalComments((prev) => {
            // Check if we already added it optimistically
            if (prev.some((c) => c.id === newC.id)) return prev;

            if (!newRow.parent_id) {
              return [newC, ...prev];
            } else {
              // It's a reply
              return prev.map((c) => {
                if (c.id === newRow.parent_id) {
                  const existingReplies = c.replies || [];
                  if (existingReplies.some((r) => r.id === newC.id)) return c;
                  return { ...c, replies: [...existingReplies, newC] };
                }
                return c;
              });
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const userId = currentUser?.id || 'anonymous';
    const text = newComment.trim();
    
    // Optimistic update
    const optimisticId = `local_${Date.now()}`;
    const optimisticComment: Comment = {
      id: optimisticId,
      videoId,
      author: {
        id: userId,
        name: currentUser?.name || 'You',
        avatarUrl: currentUser?.avatarUrl || 'https://picsum.photos/seed/me/40/40',
      },
      content: text,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    setLocalComments((prev) => [optimisticComment, ...prev]);
    setNewComment('');
    setFocused(false);

    // Actual API call
    try {
      await postComment(videoId, text, userId);
    } catch (err) {
      console.error('Failed to post comment', err);
      // Remove optimistic comment on failure
      setLocalComments((prev) => prev.filter((c) => c.id !== optimisticId));
    }
  };

  const displayComments = sortBy === 'top'
    ? [...localComments].sort((a, b) => b.likes - a.likes)
    : [...localComments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6">
        <h2 className="text-text-primary font-bold text-lg">
          {localComments.length.toLocaleString()} Comments
        </h2>

        {/* Sort selector */}
        <div className="relative group">
          <button className="flex items-center gap-1 text-text-primary text-sm font-medium hover:text-brand transition-colors">
            <span>Sort by</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute top-8 left-0 w-40 bg-surface-elevated border border-border rounded-xl shadow-2xl py-1 opacity-0 pointer-events-none group-focus-within:opacity-100 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
            {(['top', 'new'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  sortBy === opt
                    ? 'text-text-primary bg-surface-tertiary'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                }`}
              >
                {opt === 'top' ? 'Top Comments' : 'Newest First'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New comment input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden relative">
          {currentUser?.avatarUrl ? (
            <Image src={currentUser.avatarUrl} alt={currentUser.name} fill className="object-cover" sizes="40px" />
          ) : (
            'U'
          )}
        </div>

        <div className="flex-1">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => setFocused(true)}
            className="w-full bg-transparent border-b border-border focus:border-text-primary text-text-primary placeholder-text-muted text-sm py-2 outline-none transition-colors"
          />

          {focused && (
            <div className="flex justify-end gap-2 mt-3 animate-fade-in">
              <button
                type="button"
                onClick={() => { setNewComment(''); setFocused(false); }}
                className="px-4 py-2 rounded-full text-sm text-text-primary hover:bg-surface-tertiary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 rounded-full text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments list */}
      <ul className="space-y-6">
        {displayComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </ul>
    </section>
  );
}

function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  return (
    <li className="flex gap-3">
      {/* Avatar */}
      <div className={`relative rounded-full overflow-hidden bg-surface-tertiary shrink-0 ${isReply ? 'w-7 h-7' : 'w-10 h-10'}`}>
        <Image
          src={comment.author.avatarUrl}
          alt={comment.author.name}
          fill
          className="object-cover"
          sizes={isReply ? '28px' : '40px'}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Author + time */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-text-primary text-sm font-semibold">{comment.author.name}</span>
          <span className="text-text-muted text-xs">{timeAgo(comment.createdAt)}</span>
        </div>

        {/* Content */}
        <p className="text-text-secondary text-sm leading-relaxed">{comment.content}</p>

        {/* Reactions */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => { setLiked((v) => !v); if (disliked) setDisliked(false); }}
            className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-brand' : 'text-text-muted hover:text-text-primary'}`}
          >
            <ThumbsUp className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
            <span>{formatViews(comment.likes + (liked ? 1 : 0))}</span>
          </button>

          <button
            onClick={() => { setDisliked((v) => !v); if (liked) setLiked(false); }}
            className={`flex items-center gap-1 text-xs transition-colors ${disliked ? 'text-brand' : 'text-text-muted hover:text-text-primary'}`}
          >
            <ThumbsDown className="w-3.5 h-3.5" fill={disliked ? 'currentColor' : 'none'} />
          </button>

          {!isReply && (
            <button
              onClick={() => setShowReplyInput((v) => !v)}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors font-medium"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReplyInput && (
          <div className="mt-3 flex gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              U
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`@${comment.author.name} `}
                className="w-full bg-transparent border-b border-border focus:border-text-primary text-text-primary placeholder-text-muted text-sm py-1.5 outline-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setReplyText(''); setShowReplyInput(false); }}
                  className="px-3 py-1.5 rounded-full text-xs text-text-primary hover:bg-surface-tertiary transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!replyText.trim()}
                  onClick={() => { setReplyText(''); setShowReplyInput(false); }}
                  className="px-3 py-1.5 rounded-full text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Show replies */}
        {comment.replies && comment.replies.length > 0 && !isReply && (
          <div className="mt-3">
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
            >
              {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>

            {showReplies && (
              <ul className="mt-3 space-y-4 pl-2 animate-fade-in">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
