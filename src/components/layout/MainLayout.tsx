'use client';

import { useStore } from '@/hooks/useStore';
import { cn } from '@/utils/formatters';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AuthProvider from '@/components/auth/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface-primary text-text-primary">
        <Navbar />
        <Sidebar />

        {/* Page content shifts right based on sidebar state */}
        <main
          className={cn(
            'pt-14 min-h-screen transition-all duration-300 ease-in-out',
            sidebarOpen ? 'ml-60' : 'ml-16',
          )}
        >
          {children}
        </main>

        <AuthModal />
      </div>
    </AuthProvider>
  );
}
