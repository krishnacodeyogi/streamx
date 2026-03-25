'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Flame,
  Music2,
  Gamepad2,
  Newspaper,
  Users,
  History,
  ThumbsUp,
  PlaySquare,
  Clock,
  ChevronRight,
  Zap,
  Trophy,
  Clapperboard,
  LayoutDashboard,
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/utils/formatters';

// ─── Nav item types ───────────────────────────────────────────────────────────
interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const MAIN_LINKS: NavItem[] = [
  { href: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
  { href: '/shorts', icon: <Zap className="w-5 h-5" />, label: 'Shorts' },
  { href: '/subscriptions', icon: <Users className="w-5 h-5" />, label: 'Subscriptions' },
];

const YOU_LINKS: NavItem[] = [
  { href: '/library', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Library' },
  { href: '/history', icon: <History className="w-5 h-5" />, label: 'History' },
  { href: '/playlists', icon: <PlaySquare className="w-5 h-5" />, label: 'Playlists' },
  { href: '/liked', icon: <ThumbsUp className="w-5 h-5" />, label: 'Liked Videos' },
  { href: '/watch-later', icon: <Clock className="w-5 h-5" />, label: 'Watch Later' },
];

const EXPLORE_LINKS: NavItem[] = [
  { href: '/?cat=Gaming', icon: <Gamepad2 className="w-5 h-5" />, label: 'Gaming' },
  { href: '/?cat=Music', icon: <Music2 className="w-5 h-5" />, label: 'Music' },
  { href: '/?cat=News', icon: <Newspaper className="w-5 h-5" />, label: 'News' },
  { href: '/?cat=Sports', icon: <Trophy className="w-5 h-5" />, label: 'Sports' },
  { href: '/?cat=Entertainment', icon: <Clapperboard className="w-5 h-5" />, label: 'Movies & TV' },
  { href: '/trending', icon: <Flame className="w-5 h-5" />, label: 'Trending' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  // Mini sidebar (icons only) vs Full sidebar
  return (
    <>
      {/* Full sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 bottom-0 z-40 bg-surface-primary overflow-y-auto overflow-x-hidden',
          'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent',
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        {/* Main nav */}
        <nav className="py-3">
          <SidebarSection links={MAIN_LINKS} isOpen={sidebarOpen} pathname={pathname} />

          {sidebarOpen && (
            <>
              <Divider />
              <SectionLabel label="You" />
              <SidebarSection links={YOU_LINKS} isOpen={sidebarOpen} pathname={pathname} />

              <Divider />
              <SectionLabel label="Explore" />
              <SidebarSection links={EXPLORE_LINKS} isOpen={sidebarOpen} pathname={pathname} />

              <Divider />
              <div className="px-4 py-3">
                <p className="text-text-muted text-xs leading-relaxed">
                  © 2026 StreamX · Privacy · Terms
                </p>
              </div>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

function SidebarSection({
  links,
  isOpen,
  pathname,
}: {
  links: NavItem[];
  isOpen: boolean;
  pathname: string;
}) {
  return (
    <ul className="space-y-0.5 px-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'flex items-center gap-4 px-2 py-2.5 rounded-xl text-sm font-medium transition-colors',
                'group relative',
                active
                  ? 'bg-surface-tertiary text-text-primary'
                  : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary',
                !isOpen && 'justify-center px-3',
              )}
              title={!isOpen ? link.label : undefined}
            >
              <span className={cn(active ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary')}>
                {link.icon}
              </span>
              {isOpen && <span className="truncate">{link.label}</span>}
              {isOpen && link.badge && (
                <span className="ml-auto bg-brand text-white text-xs rounded-full px-1.5 py-0.5">
                  {link.badge}
                </span>
              )}
              {/* Tooltip for mini sidebar */}
              {!isOpen && (
                <span className="absolute left-14 bg-surface-elevated text-text-primary text-xs px-2 py-1 rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-xl border border-border z-50">
                  {link.label}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Divider() {
  return <hr className="my-3 border-border mx-2" />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-4 pb-1 pt-0.5 text-text-primary text-sm font-semibold tracking-wide">
      {label}
    </p>
  );
}
