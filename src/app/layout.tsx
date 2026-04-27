import type { Metadata, Viewport } from 'next';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Karis Link | Plataforma',
  description: 'Gestão inteligente de links',
  applicationName: 'Karis Link',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/karis-favicon.png?v=4', type: 'image/png' },
      { url: '/favicon.ico?v=4', sizes: 'any' },
    ],
    apple: '/apple-icon.png?v=4',
  },
  appleWebApp: {
    title: 'Karis Link',
    capable: true,
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
