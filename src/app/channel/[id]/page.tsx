import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getChannel, getVideos } from '@/lib/api';
import VideoCard from '@/components/home/VideoCard';
import { CheckCircle2, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const channel = await getChannel(params.id);
  if (!channel) return { title: 'Channel Not Found' };
  return {
    title: `${channel.name} - StreamX`,
    description: `Watch videos from ${channel.name} on StreamX`,
  };
}

export default async function ChannelPage({ params }: PageProps) {
  const channel = await getChannel(params.id);
  if (!channel) notFound();

  const videos = await getVideos({ channelId: channel.id });

  return (
    <div className="min-h-screen pb-16">
      {/* Cover Banner */}
      <div className="h-40 sm:h-56 bg-surface-tertiary w-full">
        {channel.bannerUrl ? (
          <img src={channel.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-80" />
        )}
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        {/* Channel Info Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-12 sm:-mt-16 mb-8 relative z-10">
          <img
            src={channel.avatarUrl}
            alt={channel.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface-primary object-cover bg-surface-tertiary"
          />
          <div className="flex-1 text-center sm:text-left pt-2 sm:pt-16">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2 text-text-primary">
              {channel.name}
              {channel.verified && <CheckCircle2 className="w-5 h-5 text-text-secondary" />}
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-text-secondary text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {channel.subscribers.toLocaleString()} subscribers
              </span>
              <span>{videos.length} videos</span>
            </div>
            {channel.bio && (
              <p className="mt-3 text-text-muted text-sm line-clamp-2 max-w-2xl mx-auto sm:mx-0">
                {channel.bio}
              </p>
            )}
          </div>
          <div className="sm:pt-16 shrink-0">
            <button className="px-6 py-2 bg-text-primary text-surface-primary font-medium rounded-full hover:bg-text-secondary transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Channel Content Nav (placeholder) */}
        <div className="flex items-center gap-6 border-b border-border mb-6 overflow-x-auto scrollbar-none">
          <button className="py-3 text-text-primary border-b-2 border-text-primary font-medium whitespace-nowrap">
            Videos
          </button>
          <button className="py-3 text-text-muted hover:text-text-primary font-medium whitespace-nowrap transition-colors">
            Shorts
          </button>
          <button className="py-3 text-text-muted hover:text-text-primary font-medium whitespace-nowrap transition-colors">
            Playlists
          </button>
          <button className="py-3 text-text-muted hover:text-text-primary font-medium whitespace-nowrap transition-colors">
            Community
          </button>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>This channel has no videos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} hideChannel />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
