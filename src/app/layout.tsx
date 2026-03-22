import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: { default: 'StreamX', template: '%s | StreamX' },
  description: 'StreamX – Watch, share, and discover the world\'s best videos.',
  keywords: ['video streaming', 'watch videos', 'streamx', 'youtube alternative'],
  authors: [{ name: 'StreamX Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0F0F0F',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'StreamX',
    description: 'StreamX – Watch, share, and discover the world\'s best videos.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface-primary transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
