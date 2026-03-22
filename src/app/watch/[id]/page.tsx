import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getVideoById, getComments } from '@/lib/api';
import VideoPlayer from '@/components/watch/VideoPlayer';
import VideoInfo from '@/components/watch/VideoInfo';
import CommentsSection from '@/components/watch/CommentsSection';
import RelatedVideos from '@/components/watch/RelatedVideos';
import ViewTracker from '@/components/watch/ViewTracker';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const video = await getVideoById(params.id);
  if (!video) return { title: 'Video Not Found' };
  return {
    title: video.title,
    description: video.description.slice(0, 160),
    openGraph: {
      title: video.title,
      description: video.description.slice(0, 160),
      images: [{ url: video.thumbnailUrl }],
      type: 'video.other',
    },
  };
}

export default async function WatchPage({ params }: PageProps) {
  const video = await getVideoById(params.id);
  if (!video) notFound();

  const comments = await getComments(video.id);

  return (
    <div className="min-h-screen p-4 pb-16">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── Left: Player + Info + Comments ── */}
          <div className="flex-1 min-w-0">
            <VideoPlayer
              src={video.videoUrl}
              title={video.title}
              poster={video.thumbnailUrl}
            />
            <ViewTracker videoId={video.id} />
            <VideoInfo video={video} />
            <CommentsSection
              videoId={video.id}
              comments={comments}
              totalCount={comments.length}
            />
          </div>

          {/* ── Right: Related Videos ── */}
          <div className="xl:w-96 shrink-0">
            <RelatedVideos currentVideoId={video.id} category={video.category} />
          </div>
        </div>
      </div>
    </div>
  );
}
