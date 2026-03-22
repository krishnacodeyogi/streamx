import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getChannel, getVideos } from '@/lib/api';
import type { Video } from '@/types';
import VideoCard from '@/components/home/VideoCard';
import SubscribeButton from '@/components/channel/SubscribeButton';
import { CheckCircle2, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
  searchParams: { tab?: string };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  const channel = await getChannel(id);
  if (!channel) return { title: 'Channel Not Found' };
  return {
    title: `${channel.name} - StreamX`,
    description: `Watch videos from ${channel.name} on StreamX`,
  };
}

export default async function ChannelPage({ params, searchParams }: PageProps) {
  const { id } = params;
  const channel = await getChannel(id);
  if (!channel) notFound();

  const tab = searchParams.tab || 'videos';

  let videos: Video[] = [];
  if (tab === 'videos' || tab === 'shorts') {
    videos = await getVideos({ 
      channelId: id, 
      shortsOnly: tab === 'shorts',
      excludeShorts: tab === 'videos'
    });
  }

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
            <SubscribeButton channelId={channel.id} />
          </div>
        </div>

        {/* Channel Content Nav */}
        <div className="flex items-center gap-6 border-b border-border mb-6 overflow-x-auto scrollbar-none">
          <Link
            href={`/channel/${channel.id}?tab=videos`}
            className={`py-3 font-medium whitespace-nowrap transition-colors ${
              tab === 'videos'
                ? 'text-text-primary border-b-2 border-text-primary'
                : 'text-text-muted hover:text-text-primary border-b-2 border-transparent'
            }`}
          >
            Videos
          </Link>
          <Link
            href={`/channel/${channel.id}?tab=shorts`}
            className={`py-3 font-medium whitespace-nowrap transition-colors ${
              tab === 'shorts'
                ? 'text-text-primary border-b-2 border-text-primary'
                : 'text-text-muted hover:text-text-primary border-b-2 border-transparent'
            }`}
          >
            Shorts
          </Link>
          <Link
            href={`/channel/${channel.id}?tab=playlists`}
            className={`py-3 font-medium whitespace-nowrap transition-colors ${
              tab === 'playlists'
                ? 'text-text-primary border-b-2 border-text-primary'
                : 'text-text-muted hover:text-text-primary border-b-2 border-transparent'
            }`}
          >
            Playlists
          </Link>
          <Link
            href={`/channel/${channel.id}?tab=community`}
            className={`py-3 font-medium whitespace-nowrap transition-colors ${
              tab === 'community'
                ? 'text-text-primary border-b-2 border-text-primary'
                : 'text-text-muted hover:text-text-primary border-b-2 border-transparent'
            }`}
          >
            Community
          </Link>
        </div>

        {/* Content Area */}
        {tab === 'playlists' || tab === 'community' ? (
          <div className="text-center py-20 text-text-muted">
            <p className="text-lg">This section is coming soon!</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>This channel has no {tab === 'shorts' ? 'shorts' : 'videos'} yet.</p>
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
