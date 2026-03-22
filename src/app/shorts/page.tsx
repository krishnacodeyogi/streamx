import type { Metadata } from 'next';
import ShortsPlayer from '@/components/shorts/ShortsPlayer';
import { getVideos } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Shorts – StreamX',
};

export default async function ShortsPage() {
  const videos = await getVideos({ shortsOnly: true });

  return <ShortsPlayer videos={videos} />;
}
