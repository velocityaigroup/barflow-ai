import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toast } from '@/components/ui/Toast';
import { StoreInitializer } from '@/components/StoreInitializer';

export const metadata: Metadata = {
  title: 'Velocity AI BarFlow',
  description: 'Offline-first AI-powered POS for bars, restaurants & beach clubs',
  manifest: '/manifest.json',
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
        <StoreInitializer />
        {children}
        <Toast />
      </body>
    </html>
  );
}
