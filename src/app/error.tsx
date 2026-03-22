'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] gap-6 text-center px-4">
      <AlertTriangle className="w-20 h-20 text-brand opacity-60" />
      <div>
        <h2 className="text-text-primary text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-text-muted text-sm">{error.message || 'An unexpected error occurred.'}</p>
      </div>
      <button
        onClick={reset}
        className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-full font-medium transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>
    </div>
  );
}
