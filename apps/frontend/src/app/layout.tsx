import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'My Museum of Failures',
  description: 'An emotionally immersive digital museum where failures are preserved as meaningful artifacts.',
  keywords: ['failure', 'museum', 'emotional', 'archive', 'storytelling'],
  openGraph: {
    title: 'My Museum of Failures',
    description: 'An emotionally immersive digital museum where failures are preserved as meaningful artifacts.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>
          {children}
          <AudioManager />
          <CuratorChat />
        </Providers>
      </body>
    </html>
  );
}
