import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toast } from '@/components/ui/Toast';
import { StoreInitializer } from '@/components/StoreInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DemoBanner } from '@/components/ui/DemoBanner';
import { DemoActivitySimulator } from '@/components/DemoActivitySimulator';

export const metadata: Metadata = {
  title: 'BarFlow AI — Hospitality POS by Velocity AI Group',
  description: 'Offline-first AI-powered POS for bars, restaurants & beach clubs. ≤3 taps, real-time bar & kitchen routing, live analytics.',
  manifest: '/manifest.json',
  keywords: ['POS', 'bar', 'restaurant', 'hospitality', 'AI', 'offline'],
  openGraph: {
    title: 'BarFlow AI',
    description: 'The hospitality POS that works as fast as your team — online or off.',
    siteName: 'BarFlow by Velocity AI Group',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B0F14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <ErrorBoundary>
          <DemoBanner />
          <DemoActivitySimulator />
          <StoreInitializer />
          {children}
          <Toast />
        </ErrorBoundary>
      </body>
    </html>
  );
}
