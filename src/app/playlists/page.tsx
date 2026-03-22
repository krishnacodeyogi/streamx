'use client';

import { useState, useEffect } from 'react';
import { PlaySquare, Plus, Lock, Globe, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getPlaylists, deletePlaylist } from '@/lib/api';
import { useStore } from '@/hooks/useStore';
import type { Playlist } from '@/types';
import CreatePlaylistModal from '@/components/playlists/CreatePlaylistModal';

export default function PlaylistsPage() {
  const currentUser = useStore((s) => s.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadPlaylists() {
      if (!currentUser) {
        setPlaylists([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getPlaylists(currentUser.id);
        setPlaylists(data);
      } catch (err) {
        console.error('Failed to load playlists:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlaylists();
  }, [currentUser]);

  const handleCreateSuccess = (newPlaylist: Playlist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete playlist', err);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-screen-2xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-tertiary flex items-center justify-center">
            <PlaySquare className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Playlists</h1>
            <p className="text-text-muted text-sm mt-0.5">Your personal collections</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            if (!currentUser) {
              alert('Please sign in to create a playlist.');
              return;
            }
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-text-primary text-surface-primary px-4 py-2 rounded-full font-medium hover:bg-text-secondary transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Playlist</span>
        </button>
      </div>

      {!currentUser ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-xl font-semibold text-text-primary mb-2">Sign in to view playlists</p>
          <p className="text-text-muted max-w-sm">Sign in with an account to see your saved playlists or create new ones.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-text-muted animate-fade-in text-center">
          <div className="w-24 h-24 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
            <PlaySquare className="w-12 h-12 opacity-30" />
          </div>
          <p className="text-xl font-semibold text-text-primary">No playlists yet</p>
          <p className="text-text-muted max-w-sm">Create playlists to organize videos you love and share them with others.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-brand font-medium hover:underline"
          >
            Create your first playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="group relative bg-surface-secondary rounded-xl overflow-hidden hover:bg-surface-tertiary transition-colors border border-border/50 hover:border-border">
              <Link href={`/playlists/${playlist.id}`} className="block aspect-video bg-surface-tertiary relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                   <PlaySquare className="w-12 h-12 text-text-muted opacity-50 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 text-white font-medium">
                    <PlaySquare className="w-5 h-5" />
                    <span>Play all</span>
                  </div>
                </div>
                {/* Playlist Video Count overlay */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1.5">
                  <PlaySquare className="w-3.5 h-3.5" />
                  {playlist.videoIds.length}
                </div>
              </Link>
              
              <div className="p-4 flex gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary font-medium line-clamp-1 group-hover:text-brand transition-colors">
                    {playlist.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-text-muted text-sm line-clamp-1 flex-1">
                      {playlist.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                     {playlist.isPrivate ? (
                       <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
                     ) : (
                       <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Public</span>
                     )}
                     <span>•</span>
                     <span>Set {new Date(playlist.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(playlist.id);
                  }}
                  className="shrink-0 p-2 h-fit rounded-full text-text-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreatePlaylistModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
