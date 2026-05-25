import type { Metadata, Viewport } from 'next';
import { Inter, EB_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AudioManager } from '@/components/audio/audio-manager';
import { CuratorChat } from '@/components/ai/curator-chat';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0d0b0a',
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
  title: 'My Museum of Failures',
  description:
    'An emotionally immersive digital museum where failures are preserved as meaningful artifacts.',
  keywords: ['failure', 'museum', 'emotional', 'archive', 'storytelling'],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'My Museum of Failures',
    description:
      'An emotionally immersive digital museum where failures are preserved as meaningful artifacts.',
    type: 'website',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'My Museum of Failures' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Museum of Failures',
    description:
      'An emotionally immersive digital museum where failures are preserved as meaningful artifacts.',
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} font-sans relative film-grain`}>
        <Providers>
          {children}
          <AudioManager />
          <CuratorChat />
        </Providers>
      </body>
    </html>
  );
}
