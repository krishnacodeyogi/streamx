'use client';

import { PlaySquare, Plus } from 'lucide-react';

export default function PlaylistsPage() {
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
        
        <button className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-full font-medium hover:bg-brand/90 transition-colors shadow-lg">
          <Plus className="w-5 h-5" />
          <span>New Playlist</span>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center h-96 gap-4 text-text-muted animate-fade-in text-center">
        <div className="w-24 h-24 rounded-full bg-surface-tertiary flex items-center justify-center mb-4">
          <PlaySquare className="w-12 h-12 opacity-30" />
        </div>
        <p className="text-xl font-semibold text-text-primary">No playlists yet</p>
        <p className="text-text-muted max-w-sm">Create playlists to organize videos you love and share them with others.</p>
        <button className="mt-4 text-brand font-medium hover:underline">
          Learn how to create a playlist
        </button>
      </div>
    </div>
  );
}
