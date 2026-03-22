'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Film,
  X,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  PlaySquare,
  Smartphone,
} from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import { uploadVideoLocal, uploadThumbnailLocal, saveVideoMetadataLocal } from '@/lib/api';
import { useStore } from '@/hooks/useStore';

type VideoType = 'short' | 'full';
type Step = 'select' | 'choose-type' | 'details' | 'uploading' | 'done';

const UPLOAD_CATEGORIES = CATEGORIES.filter((c) => c !== 'All');

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const currentUser = useStore((s) => s.currentUser);

  const [step, setStep] = useState<Step>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [videoType, setVideoType] = useState<VideoType>('full');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(UPLOAD_CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState('');

  // Upload state
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [createdVideoId, setCreatedVideoId] = useState('');

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [videoPreviewUrl, thumbnailPreviewUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setError('');
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
    setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    setStep('choose-type');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const generateThumbnail = useCallback(() => {
    const video = videoPreviewRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        setThumbnailBlob(blob);
        setThumbnailPreviewUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.85);
  }, []);

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) return;

    setStep('uploading');
    setProgress(0);
    setError('');

    const channelId = currentUser?.id || 'default';
    const videoId = `v_${Date.now()}`;

    try {
      // Step 1: Upload video file
      setStatusText('Uploading video to server...');
      setProgress(10);
      const videoUrl = await uploadVideoLocal(videoFile, (percent) => {
        // Since it's local, progress might be fast or not reported well by simple fetch
        setProgress(10 + Math.round(percent * 0.7));
      });
      setProgress(80);

      // Step 2: Upload thumbnail
      let thumbnailUrl = '';
      if (thumbnailBlob) {
        setStatusText('Uploading thumbnail...');
        thumbnailUrl = await uploadThumbnailLocal(thumbnailBlob);
      }
      setProgress(90);

      // Step 3: Get video duration
      const videoDuration = videoPreviewRef.current?.duration ?? 0;
      const duration = formatDuration(videoDuration);

      // Step 4: Save metadata
      setStatusText('Saving video details...');
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await saveVideoMetadataLocal({
        id: videoId,
        title: title.trim(),
        description: description.trim(),
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        duration,
        category,
        tags,
        channel_id: channelId,
        channel_name: currentUser?.name,
        channel_avatar_url: currentUser?.avatarUrl,
        is_short: videoType === 'short',
      });
      setProgress(100);

      setCreatedVideoId(videoId);
      setStatusText('Upload complete!');
      setStep('done');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message ?? 'Upload failed. Please try again.');
      setStep('details');
    }
  };


  // ─── Step 1: Select Video ─────────────────────────────────────────────────

  if (step === 'select') {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary">Upload video</h1>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-4 p-16 border-2 border-dashed rounded-2xl cursor-pointer transition-colors
            ${dragOver ? 'border-brand bg-brand/5' : 'border-border hover:border-text-muted bg-surface-secondary'}
          `}
        >
          <div className="w-16 h-16 rounded-full bg-surface-tertiary flex items-center justify-center">
            <Upload className="w-8 h-8 text-text-muted" />
          </div>
          <div className="text-center">
            <p className="text-text-primary font-medium">Drag and drop a video file to upload</p>
            <p className="text-text-muted text-sm mt-1">Or click to browse files</p>
          </div>
          <p className="text-text-muted text-xs">MP4, WebM, or MOV</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    );
  }

  // ─── Step 1.5: Choose Video Type ─────────────────────────────────────────

  if (step === 'choose-type') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Choose video type</h1>
          <button
            onClick={() => { setStep('select'); setVideoFile(null); setVideoPreviewUrl(''); }}
            className="p-2 rounded-full hover:bg-surface-tertiary transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <p className="text-text-muted text-sm">
          How do you want to publish this video?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {/* Short Video option */}
          <button
            onClick={() => { setVideoType('short'); setStep('details'); }}
            className={`group relative flex flex-col items-center gap-4 p-8 border-2 rounded-2xl transition-all hover:shadow-lg ${
              videoType === 'short'
                ? 'border-brand bg-brand/5'
                : 'border-border hover:border-brand/50 bg-surface-secondary'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-text-primary font-semibold text-lg">Short Video</h3>
              <p className="text-text-muted text-sm mt-1">
                Vertical, short-form content. Appears in the Shorts feed.
              </p>
            </div>
            <span className="px-3 py-1 bg-pink-500/10 text-pink-500 text-xs font-medium rounded-full">
              Shorts
            </span>
          </button>

          {/* Full Video option */}
          <button
            onClick={() => { setVideoType('full'); setStep('details'); }}
            className={`group relative flex flex-col items-center gap-4 p-8 border-2 rounded-2xl transition-all hover:shadow-lg ${
              videoType === 'full'
                ? 'border-brand bg-brand/5'
                : 'border-border hover:border-brand/50 bg-surface-secondary'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <PlaySquare className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-text-primary font-semibold text-lg">Full Video</h3>
              <p className="text-text-muted text-sm mt-1">
                Regular video content. Appears on the home feed.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded-full">
              Video
            </span>
          </button>
        </div>

        {/* Selected file info */}
        <div className="flex items-center gap-2 text-text-muted text-xs pt-2">
          <Film className="w-3 h-3" />
          <span>{videoFile?.name}</span>
          <span>({(videoFile!.size / (1024 * 1024)).toFixed(1)} MB)</span>
        </div>
      </div>
    );
  }

  // ─── Step 2: Details ──────────────────────────────────────────────────────

  if (step === 'details') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Video details</h1>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              videoType === 'short'
                ? 'bg-pink-500/10 text-pink-500'
                : 'bg-blue-500/10 text-blue-500'
            }`}>
              {videoType === 'short' ? 'Short' : 'Video'}
            </span>
          </div>
          <button
            onClick={() => setStep('choose-type')}
            className="p-2 rounded-full hover:bg-surface-tertiary transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form fields */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title that describes your video"
                maxLength={100}
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder-text-muted text-sm outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-text-muted text-xs mt-1 text-right">{title.length}/100</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                rows={5}
                maxLength={5000}
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder-text-muted text-sm outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-text-primary text-sm outline-none focus:border-blue-500 transition-colors"
              >
                {UPLOAD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1">Tags</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Comma-separated tags (e.g. react, tutorial, webdev)"
                className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg text-text-primary placeholder-text-muted text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            {/* Video preview */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1">Video preview</label>
              <div className="rounded-xl overflow-hidden bg-black aspect-video">
                <video
                  ref={videoPreviewRef}
                  src={videoPreviewUrl}
                  className="w-full h-full object-contain"
                  controls
                  onLoadedData={() => {
                    // Seek to 25% to get a representative frame
                    const video = videoPreviewRef.current;
                    if (video && video.duration) {
                      video.currentTime = video.duration * 0.25;
                    }
                  }}
                  onSeeked={() => {
                    if (!thumbnailBlob) generateThumbnail();
                  }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2 text-text-muted text-xs">
                <Film className="w-3 h-3" />
                <span>{videoFile?.name}</span>
                <span>({(videoFile!.size / (1024 * 1024)).toFixed(1)} MB)</span>
              </div>
            </div>

            {/* Thumbnail preview */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1">Thumbnail</label>
              {thumbnailPreviewUrl ? (
                <div className="rounded-xl overflow-hidden aspect-video bg-surface-tertiary">
                  <img src={thumbnailPreviewUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="rounded-xl aspect-video bg-surface-tertiary flex items-center justify-center">
                  <div className="text-center text-text-muted">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">Auto-generating...</p>
                  </div>
                </div>
              )}
              <button
                onClick={generateThumbnail}
                className="mt-2 text-brand text-xs hover:underline"
              >
                Regenerate thumbnail
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={() => setStep('choose-type')}
            className="px-6 py-2.5 text-text-secondary hover:text-text-primary text-sm font-medium rounded-full hover:bg-surface-tertiary transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleUpload}
            disabled={!title.trim()}
            className="px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 3: Uploading ────────────────────────────────────────────────────

  if (step === 'uploading') {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-surface-tertiary flex items-center justify-center">
          <Upload className="w-10 h-10 text-brand animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">Uploading your video...</h2>
          <p className="text-text-muted text-sm">{statusText}</p>
        </div>
        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-text-muted text-xs mt-2 text-center">{progress}%</p>
        </div>
      </div>
    );
  }

  // ─── Step 4: Done ─────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-text-primary">
          {videoType === 'short' ? 'Short uploaded!' : 'Video uploaded!'}
        </h2>
        <p className="text-text-muted text-sm">
          {videoType === 'short'
            ? 'Your Short is now live in the Shorts feed on StreamX'
            : 'Your video is now live on StreamX'}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => router.push(videoType === 'short' ? '/shorts' : `/watch/${createdVideoId}`)}
          className="px-6 py-2.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-red-700 transition-colors"
        >
          {videoType === 'short' ? 'View Shorts' : 'Watch video'}
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2.5 text-text-secondary hover:text-text-primary text-sm font-medium rounded-full bg-surface-tertiary hover:bg-border transition-colors"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
