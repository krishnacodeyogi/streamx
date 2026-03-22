'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/hooks/useStore';
import { updateChannel, uploadThumbnailLocal } from '@/lib/api';
import { Camera, Save, Loader2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const currentUser = useStore((s) => s.currentUser);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setBannerUrl(currentUser.bannerUrl || '');
    }
  }, [currentUser]);

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    try {
      setLoading(true);
      // Reusing uploadThumbnailLocal as it handles image uploads to public/uploads/thumbnails
      const url = await uploadThumbnailLocal(file);
      if (type === 'avatar') setAvatarUrl(url);
      else setBannerUrl(url);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const updatedChannel = await updateChannel(currentUser.id, {
        name,
        bio,
        avatarUrl,
        bannerUrl,
      });

      // Update global store state immediately
      setCurrentUser({
        ...currentUser,
        name: updatedChannel.name,
        avatarUrl: updatedChannel.avatarUrl,
        bannerUrl: updatedChannel.bannerUrl,
        bio: updatedChannel.bio,
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-text-muted">Please sign in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 pb-16">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/channel/${currentUser.id}`} className="p-2 hover:bg-surface-tertiary rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Banner Upload */}
        <div className="relative group">
          <div className="h-40 sm:h-56 bg-surface-tertiary rounded-2xl overflow-hidden relative">
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-text-muted opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-full backdrop-blur-md transition-colors"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          <input
            type="file"
            ref={bannerInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
          />
          <p className="text-xs text-text-muted mt-2 px-2">Channel Banner (Recommended: 2048 x 1152 px)</p>
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center px-4">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-surface-tertiary border-4 border-surface-primary shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-12 h-12 text-text-muted opacity-20 flex items-center justify-center border-2 border-current rounded-full">?</div>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')}
            />
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Channel Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-tertiary border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all"
                placeholder="Enter channel name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-surface-tertiary border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all resize-none"
                placeholder="Tell viewers about your channel"
              />
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-full font-bold hover:bg-brand/90 transition-all disabled:opacity-50 shadow-lg shadow-brand/20 active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
