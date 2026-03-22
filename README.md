# StreamX 🎬

> A high-end, production-ready video streaming platform built with **Next.js 14**, **Tailwind CSS**, and **Zustand** — architected for Supabase authentication and storage.

---

## Features

| Feature | Status |
|---|---|
| Dark Mode UI (default) | ✅ |
| Responsive Layout | ✅ |
| Collapsible Sidebar | ✅ |
| Top Navbar with Search | ✅ |
| Homepage Video Grid | ✅ |
| Category Filters (scrollable chips) | ✅ |
| Video Watch Page | ✅ |
| Custom HTML5 Video Player | ✅ |
| Like / Dislike buttons | ✅ |
| Subscribe button | ✅ |
| Comments Section (with replies) | ✅ |
| Related Videos panel | ✅ |
| Search Results page | ✅ |
| Loading skeletons | ✅ |
| 404 & Error pages | ✅ |
| Supabase-ready API layer | ✅ |
| Auth-ready Zustand store | ✅ |

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend (future)**: [Supabase](https://supabase.com/)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Fill in your Supabase credentials
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Navbar + Sidebar)
│   ├── page.tsx            # Homepage
│   ├── loading.tsx         # Global loading skeleton
│   ├── error.tsx           # Global error boundary
│   ├── not-found.tsx       # 404 page
│   ├── watch/[id]/         # Video watch page
│   └── search/             # Search results page
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Top navigation bar
│   │   ├── Sidebar.tsx     # Collapsible sidebar
│   │   └── MainLayout.tsx  # Layout wrapper
│   ├── home/
│   │   ├── CategoryFilter.tsx  # Scrollable category chips
│   │   ├── VideoCard.tsx       # Video thumbnail card (normal + compact)
│   │   └── VideoGrid.tsx       # Filtered/searched grid
│   └── watch/
│       ├── VideoPlayer.tsx     # Custom HTML5 player with controls
│       ├── VideoInfo.tsx       # Title, channel, like/dislike, description
│       ├── CommentsSection.tsx # Comments with nested replies
│       └── RelatedVideos.tsx   # Right-panel related video list
│
├── data/
│   └── mockData.ts         # Mock videos, channels, comments
│
├── hooks/
│   └── useStore.ts         # Zustand global store
│
├── lib/
│   ├── api.ts              # API layer (mock → Supabase-ready)
│   └── supabase.ts         # Supabase client (activate when ready)
│
├── types/
│   └── index.ts            # TypeScript interfaces
│
└── utils/
    └── formatters.ts       # Views, time, duration formatters
```

---

## Adding Real Features

### Authentication (Supabase Auth)
1. Uncomment `src/lib/supabase.ts`
2. Add sign-in/sign-up UI to the Navbar profile dropdown
3. Use `useStore.setCurrentUser()` to persist the auth state
4. Protect routes with Next.js middleware (`middleware.ts`)

### Video Upload
1. Create a Supabase Storage bucket `streamx-videos`
2. Use `uploadVideo()` helper in `src/lib/supabase.ts`
3. Add an `/upload` page with a file picker and form
4. Store video metadata in the `videos` Supabase table

### Real Database
Replace every function in `src/lib/api.ts` with Supabase queries.
Schema design (recommended tables): `users`, `videos`, `channels`, `comments`, `likes`, `subscriptions`.

---

## Deployment

Deploy to [Vercel](https://vercel.com) with zero configuration:

```bash
npx vercel
```

Add your Supabase env vars in the Vercel dashboard.

---

## License

MIT
