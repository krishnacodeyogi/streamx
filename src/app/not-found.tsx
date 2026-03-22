import Link from 'next/link';
import { Home, VideoOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] gap-6 text-center px-4">
      <VideoOff className="w-24 h-24 text-brand opacity-60" />
      <div>
        <h1 className="text-text-primary text-4xl font-bold mb-2">404</h1>
        <p className="text-text-secondary text-lg">This page isn't available</p>
        <p className="text-text-muted text-sm mt-1">
          The link you followed may be broken, or the page may have been removed.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 bg-surface-tertiary hover:bg-border text-text-primary px-6 py-3 rounded-full font-medium transition-colors"
      >
        <Home className="w-4 h-4" />
        Go Home
      </Link>
    </div>
  );
}
