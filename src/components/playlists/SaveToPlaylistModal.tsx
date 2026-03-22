'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Lock, Check } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getPlaylists, updatePlaylistVideos } from '@/lib/api';
import type { Playlist } from '@/types';
import CreatePlaylistModal from '@/components/playlists/CreatePlaylistModal';

interface SaveToPlaylistModalProps {
  videoId: string;
  onClose: () => void;
}

export default function SaveToPlaylistModal({ videoId, onClose }: SaveToPlaylistModalProps) {
  const currentUser = useStore((s) => s.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function loadPlaylists() {
      if (!currentUser) return;
      try {
        const data = await getPlaylists(currentUser.id);
        setPlaylists(data);
      } catch (error) {
        console.error('Failed to load playlists:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPlaylists();
  }, [currentUser]);

  const handleToggleVideo = async (playlist: Playlist) => {
    const isChecked = playlist.videoIds.includes(videoId);
    let newVideoIds = [...playlist.videoIds];

    if (isChecked) {
      newVideoIds = newVideoIds.filter((id) => id !== videoId);
    } else {
      newVideoIds.push(videoId);
    }

    // Optimistically update UI
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlist.id ? { ...p, videoIds: newVideoIds } : p
      )
    );

    try {
      await updatePlaylistVideos(playlist.id, newVideoIds);
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlist.id ? { ...p, videoIds: playlist.videoIds } : p
        )
      );
    }
  };

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
    setShowCreateModal(false);
  };

  // Ensure user is signed in
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-surface-elevated rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-border flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Want to save this video?</h2>
          <p className="text-text-muted mb-6">Sign in to save videos to your playlists.</p>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-5 py-2 font-medium text-text-primary hover:bg-surface-tertiary rounded-full transition-colors">
              Cancel
            </button>
            {/* Ideally this would pop the Auth Modal, but since AuthProvider controls that we just close for now */}
            <button onClick={onClose} className="px-5 py-2 bg-text-primary text-surface-primary font-medium rounded-full hover:bg-text-secondary transition-colors">
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="bg-surface-elevated rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-border flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary">Save to playlist</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-tertiary text-text-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
              </div>
            ) : playlists.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                You don't have any playlists yet.
              </div>
            ) : (
              <ul className="space-y-1">
                {playlists.map((playlist) => {
                  const isChecked = playlist.videoIds.includes(videoId);
                  return (
                    <li key={playlist.id}>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); handleToggleVideo(playlist); }}
                        className="flex items-center text-left gap-3 w-full p-3 rounded-lg hover:bg-surface-tertiary cursor-pointer transition-colors"
                      >
                        <div className={`flex shrink-0 items-center justify-center w-5 h-5 rounded border ${isChecked ? 'bg-brand border-brand' : 'border-text-muted bg-transparent'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-text-primary text-sm font-medium line-clamp-1 flex-1">
                          {playlist.name}
                        </span>
                        {playlist.isPrivate && <Lock className="w-3 h-3 text-text-muted" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="p-4 border-t border-border bg-surface-primary">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg hover:bg-surface-tertiary text-text-primary text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create new playlist
            </button>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePlaylistModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handlePlaylistCreated}
        />
      )}
    </>
  );
}

