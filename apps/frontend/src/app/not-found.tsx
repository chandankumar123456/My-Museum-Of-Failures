'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Eyebrow } from '@/components/lamplit';

/**
 * Lamplit Archive — Not Found.
 *
 * Composed empty state at the route level. A faded line-illustration
 * artifact (a sealed envelope split open) + the canonical "exhibit lost
 * to time" copy + a single brass return CTA. No filler particles, no
 * vignette, no synthetic stats.
 */
export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-bone text-ink flex items-center justify-center px-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.9 }}
        className="max-w-[44ch] text-center space-y-8"
      >
        <FadedArtifact />

        <div className="space-y-3">
          <Eyebrow tick={false} prefix="">EX-404 / ARCHIVAL REF NULL</Eyebrow>
          <h1 className="font-display italic text-[clamp(2rem,3.4vw,3rem)] leading-tight text-ink">
            This exhibit has been lost to time.
          </h1>
          <p className="font-sans text-[15px] leading-relaxed text-ink-muted max-w-[40ch] mx-auto">
            The artifact you were looking for no longer exists in the
            collection — or was never preserved here in the first place.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="md">
              Return to the archive
            </Button>
          </Link>
          <Link
            href="/exhibits"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass transition-colors"
          >
            Browse what's still here →
          </Link>
        </div>
      </motion.section>
    </main>
  );
}

function FadedArtifact() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24 mx-auto text-whisper"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* A sealed envelope, gently torn open at the top. */}
      <rect x="20" y="40" width="80" height="60" rx="2" />
      <path d="M22 42 L60 70 L98 42" />
      <path d="M22 100 L52 72" />
      <path d="M98 100 L68 72" />
      <circle cx="60" cy="76" r="4" className="text-brass" stroke="currentColor" />
    </svg>
  );
}
