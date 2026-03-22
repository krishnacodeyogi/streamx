'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  X,
  Mic,
  Bell,
  Upload,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useStore } from '@/hooks/useStore';
import { signOut } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const currentUser = useStore((s) => s.currentUser);
  const setShowAuthModal = useStore((s) => s.setShowAuthModal);

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    setMounted(true);
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim()) return;
    setSearchQuery(localQuery.trim());
    router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`);
    setShowMobileSearch(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowProfileMenu(false);
  };

  const userInitial = currentUser?.name?.[0]?.toUpperCase() || 'U';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface-primary flex items-center justify-between px-4 gap-4">
      {/* ── Left: Hamburger + Logo ── */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-surface-tertiary transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-text-primary" />
        </button>

        <Link href="/" className="flex items-center gap-1 select-none">
          {/* StreamX logo mark */}
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="20" rx="4" fill="#FF0000" />
            <polygon points="11,5 21,10 11,15" fill="white" />
          </svg>
          <span className="text-text-primary font-bold text-xl hidden sm:block tracking-tight">
            Stream<span className="text-brand">X</span>
          </span>
        </Link>
      </div>

      {/* ── Center: Search bar (hidden on mobile unless toggled) ── */}
      <form
        onSubmit={handleSearch}
        className={`
          flex-1 max-w-2xl mx-auto
          ${showMobileSearch ? 'flex absolute left-0 right-0 top-0 h-14 px-4 bg-surface-primary z-10 items-center gap-3' : 'hidden md:flex'}
          items-center gap-2
        `}
      >
        {showMobileSearch && (
          <button
            type="button"
            onClick={() => setShowMobileSearch(false)}
            className="p-2 rounded-full hover:bg-surface-tertiary"
          >
            <X className="w-5 h-5 text-text-primary" />
          </button>
        )}

        <div className="flex flex-1 rounded-full border border-border focus-within:border-blue-500 overflow-hidden">
          <input
            type="text"
            placeholder="Search"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="flex-1 bg-surface-secondary px-4 py-2 text-text-primary placeholder-text-muted text-sm outline-none"
          />
          <button
            type="submit"
            className="px-5 bg-surface-tertiary hover:bg-border border-l border-border transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <button
          type="button"
          className="p-3 bg-surface-tertiary hover:bg-border rounded-full transition-colors hidden sm:flex"
          aria-label="Voice search"
        >
          <Mic className="w-4 h-4 text-text-primary" />
        </button>
      </form>

      {/* ── Right: Actions + Profile ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Mobile search toggle */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="p-2 rounded-full hover:bg-surface-tertiary md:hidden transition-colors"
          aria-label="Open search"
        >
          <Search className="w-5 h-5 text-text-primary" />
        </button>

        {/* Upload button */}
        <Link href="/upload" className="p-2 rounded-full hover:bg-surface-tertiary transition-colors hidden sm:flex" aria-label="Upload video">
          <Upload className="w-5 h-5 text-text-primary" />
        </Link>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-surface-tertiary relative transition-colors hidden sm:flex" aria-label="Notifications">
          <Bell className="w-5 h-5 text-text-primary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-brand rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-1 ml-1 hover:opacity-80 transition-opacity"
            aria-label="User menu"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold select-none">
                {userInitial}
              </div>
            )}
            <ChevronDown className="w-3 h-3 text-text-secondary hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-56 bg-surface-elevated border border-border rounded-xl shadow-2xl py-2 animate-fade-in z-50">
              <div className="flex items-center gap-3 px-4 py-2 mb-1 border-b border-border">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {userInitial}
                  </div>
                )}
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    {currentUser ? currentUser.name : 'Guest User'}
                  </p>
                  <p className="text-text-muted text-xs">
                    {currentUser ? currentUser.email : 'Sign in to access more'}
                  </p>
                </div>
              </div>

              {currentUser ? (
                <>
                  <Link href={`/channel/${currentUser.id}`} onClick={() => setShowProfileMenu(false)}>
                    <MenuItem icon={<User className="w-4 h-4" />} label="Your Channel" />
                  </Link>
                  <Link href="/settings/profile" onClick={() => setShowProfileMenu(false)}>
                    <MenuItem icon={<Settings className="w-4 h-4" />} label="Edit Profile" />
                  </Link>
                  {mounted && (
                    <MenuItem
                      icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      label={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                  )}
                  <div className="my-1 border-t border-border" />
                  <MenuItem icon={<LogOut className="w-4 h-4" />} label="Sign Out" onClick={handleSignOut} />
                </>
              ) : (
                <>
                  <MenuItem
                    icon={<User className="w-4 h-4" />}
                    label="Sign In / Sign Up"
                    onClick={() => { setShowAuthModal(true); setShowProfileMenu(false); }}
                  />
                  <MenuItem icon={<Settings className="w-4 h-4" />} label="Settings" />
                  {mounted && (
                    <MenuItem
                      icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      label={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-surface-tertiary hover:text-text-primary text-sm transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
