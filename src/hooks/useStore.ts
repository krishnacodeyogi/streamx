import { create } from 'zustand';
import type { AppStore, VideoCategory, User } from '@/types';

export const useStore = create<AppStore>((set) => ({
  // ─── Sidebar ──────────────────────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // ─── Category filter ──────────────────────────────────────────────────────
  activeCategory: 'All' as VideoCategory,
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  // ─── Search ───────────────────────────────────────────────────────────────
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // ─── Auth (ready slot) ───────────────────────────────────────────────────
  currentUser: null as User | null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // ─── Auth modal ─────────────────────────────────────────────────────────
  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),
}));
