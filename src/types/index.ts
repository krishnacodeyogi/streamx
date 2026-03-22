// ─── Video Types ─────────────────────────────────────────────────────────────
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string; // "12:34"
  views: number;
  likes: number;
  dislikes: number;
  uploadedAt: string; // ISO date string
  category: VideoCategory;
  tags: string[];
  channel: Channel;
  isShort: boolean;
}

export type VideoCategory =
  | 'All'
  | 'Music'
  | 'Gaming'
  | 'News'
  | 'Sports'
  | 'Technology'
  | 'Education'
  | 'Entertainment'
  | 'Cooking'
  | 'Travel'
  | 'Comedy';

// ─── Channel Types ────────────────────────────────────────────────────────────
export interface Channel {
  id: string;
  name: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  subscribers: number;
  verified: boolean;
}

// ─── Comment Types ────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  videoId: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

// ─── User Types (ready for auth) ─────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  subscribers: number;
  subscriptions: string[]; // channel IDs
  likedVideos: string[];
  watchHistory: string[];
  createdAt: string;
}

// ─── Search / Filter Types ────────────────────────────────────────────────────
export interface SearchFilters {
  query: string;
  category: VideoCategory;
  sortBy: 'relevance' | 'date' | 'views' | 'rating';
  shortsOnly: boolean;
  excludeShorts: boolean;
}

// ─── Playlist Types ────────────────────────────────────────────────────────────
export interface Playlist {
  id: string;
  name: string;
  description: string;
  userId: string;
  videoIds: string[];
  isPrivate: boolean;
  createdAt: string;
}

// ─── Store Types (Zustand) ────────────────────────────────────────────────────
export interface AppStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  activeCategory: VideoCategory;
  setActiveCategory: (cat: VideoCategory) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Auth-ready user slot
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Auth modal
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}
