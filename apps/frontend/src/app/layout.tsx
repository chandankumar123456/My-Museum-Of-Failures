import type { Metadata, Viewport } from 'next';
import { Fraunces, Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AudioManager } from '@/components/audio/audio-manager';
import { CuratorChat } from '@/components/ai/curator-chat';
import { Lamplit3D } from '@/components/lamplit-3d';

/**
 * Lamplit Archive — typography (Phase 20).
 *
 * Fraunces is the canonical display + body essay serif (replacing the retired
 * EB Garamond). Geist is the UI / body sans (replacing DM Sans + Inter).
 * JetBrains Mono is reserved for plaque IDs, timestamps, and labelled metadata.
 *
 * Each font exposes a CSS variable that `@theme` in `globals.css` consumes via
 * `--font-display`, `--font-sans`, and `--font-mono`.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const viewport: Viewport = {
  // Lamplit Bone canvas — warm cream, never #FFFFFF.
  themeColor: '#F4EFE6',
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${geist.variable} ${jetbrainsMono.variable} font-sans bg-bone text-ink antialiased`}
      >
        <Providers>
          <Lamplit3D>
            {children}
            <AudioManager />
            <CuratorChat />
          </Lamplit3D>
        </Providers>
      </body>
    </html>
  );
}
