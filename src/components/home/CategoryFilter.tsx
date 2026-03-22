'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/utils/formatters';
import type { VideoCategory } from '@/types';

export default function CategoryFilter() {
  const activeCategory = useStore((s) => s.activeCategory);
  const setActiveCategory = useStore((s) => s.setActiveCategory);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' });
  };

  return (
    <div className="relative flex items-center bg-surface-primary border-b border-border sticky top-14 z-30 py-3">
      {/* Left scroll arrow */}
      <button
        onClick={() => scroll('left')}
        className="shrink-0 p-1 mr-1 rounded-full hover:bg-surface-tertiary transition-colors text-text-secondary hover:text-text-primary"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Pill chips */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as VideoCategory)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              activeCategory === cat
                ? 'bg-text-primary text-surface-primary'
                : 'bg-surface-tertiary text-text-primary hover:bg-border',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Right scroll arrow */}
      <button
        onClick={() => scroll('right')}
        className="shrink-0 p-1 ml-1 rounded-full hover:bg-surface-tertiary transition-colors text-text-secondary hover:text-text-primary"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
