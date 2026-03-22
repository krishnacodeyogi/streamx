'use client';

import { useState } from 'react';
import { X, Lock, Globe } from 'lucide-react';
import { createPlaylist } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import type { Playlist } from '@/types';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onSuccess: (playlist: Playlist) => void;
}

export default function CreatePlaylistModal({ onClose, onSuccess }: CreatePlaylistModalProps) {
  const currentUser = useStore((s) => s.currentUser);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to create a playlist.');
      return;
    }

    if (!name.trim()) return;

    setLoading(true);
    try {
      const newPlaylist = await createPlaylist(currentUser.id, {
        name,
        description,
        isPrivate,
      });

      if (newPlaylist) {
        onSuccess(newPlaylist);
        onClose();
      } else {
        alert('Failed to create playlist');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-elevated rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">Create a new playlist</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-tertiary text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Title (required)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Favorite JavaScript Tutorials"
              className="w-full bg-surface-tertiary border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this playlist about?"
              rows={3}
              className="w-full bg-surface-tertiary border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Privacy
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  !isPrivate 
                    ? 'border-brand bg-brand/10 text-brand' 
                    : 'border-border bg-surface-tertiary text-text-secondary hover:border-text-muted'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">Public</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  isPrivate 
                    ? 'border-brand bg-brand/10 text-brand' 
                    : 'border-border bg-surface-tertiary text-text-secondary hover:border-text-muted'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="text-sm font-medium">Private</span>
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-6 py-2.5 bg-brand text-white font-medium rounded-full hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
