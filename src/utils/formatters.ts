import { formatDistanceToNow, parseISO } from 'date-fns';

/** 1,234,567 → "1.2M views"  /  45,000 → "45K views" */
export function formatViews(views: number): string {
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`;
  return `${views}`;
}

/** 1,400,000 → "1.4M subscribers" */
export function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M subscribers`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K subscribers`;
  return `${count} subscribers`;
}

/** ISO date → "3 days ago" */
export function timeAgo(isoDate: string): string {
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

/** "12:34" duration from seconds */
export function secondsToDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  return [m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/** Merge class names (tailwind-merge + clsx) */
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}
