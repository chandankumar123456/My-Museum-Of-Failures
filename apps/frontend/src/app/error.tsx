'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Eyebrow } from '@/components/lamplit';
import { reportError } from '@/lib/report-error';

/**
 * Lamplit Archive — route error boundary. Catches runtime errors in a
 * segment and offers recovery without a white screen. Styled to match the
 * Not Found page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: 'route', digest: error.digest });
  }, [error]);

  return (
    <main className="min-h-[100dvh] bg-bone text-ink flex items-center justify-center px-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.9 }}
        className="max-w-[44ch] text-center space-y-8"
      >
        <div className="space-y-3">
          <Eyebrow tick={false} prefix="">EX-500 / EXHIBIT DISTURBED</Eyebrow>
          <h1 className="font-display italic text-[clamp(2rem,3.4vw,3rem)] leading-tight text-ink">
            Something in the archive came loose.
          </h1>
          <p className="font-sans text-[15px] leading-relaxed text-ink-muted max-w-[40ch] mx-auto">
            An unexpected error interrupted this exhibit. You can try again, or
            return to the entrance.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="md" onClick={reset}>
            Try again
          </Button>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass transition-colors"
          >
            Return to the archive →
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
