import type { Metadata } from 'next';
import CategoryFilter from '@/components/home/CategoryFilter';
import VideoGrid from '@/components/home/VideoGrid';

export const metadata: Metadata = {
  title: 'StreamX – Home',
};

export default function HomePage() {
  return (
    <>
      <CategoryFilter />
      <VideoGrid />
    </>
  );
}
