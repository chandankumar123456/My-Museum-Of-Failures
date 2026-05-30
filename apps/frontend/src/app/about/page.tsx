'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MuseumNavigation } from '@/components/museum/navigation';
import {
  Eyebrow,
  EngravedDivider,
  Button,
  Parallax,
} from '@/components/lamplit';
import { useRoomTint } from '@/components/lamplit-3d';
import { fadeUp } from '@/lib/motion';

/**
 * Lamplit Archive — About (`/about`).
 *
 * The curatorial manifesto. Centred italic Fraunces hero, 60/40 split
 * with a brass-bordered pull-quote, a 2×2 offset grid of feature cards
 * (paper + brass-on-hover), closing call-to-action band.
 */
export default function AboutPage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <Hero />
          <ManifestoSplit />
          <FeatureGrid />
          <ClosingBand />
        </div>
      </main>
    </>
  );
}

// ---- Hero ----------------------------------------------------------------

function Hero() {
  return (
    <section className="text-center max-w-[55ch] mx-auto py-16 md:py-24">
      <Parallax offset={36}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.9 }}
        className="space-y-6"
      >
        <Eyebrow>Curatorial Manifesto · 013</Eyebrow>
        <h1 className="font-display italic text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.15] tracking-tight text-ink">
          "The goal is not motivation culture or toxic positivity. The goal
          is emotional honesty."
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          — The Curator
        </p>
      </motion.div>
      </Parallax>
    </section>
  );
}

// ---- Manifesto 60/40 -----------------------------------------------------

function ManifestoSplit() {
  return (
    <section className="border-t border-glass-edge py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="md:col-span-7 space-y-6"
      >
        <Eyebrow>What this archive is</Eyebrow>
        <h2 className="font-display text-[clamp(1.875rem,2.4vw,2.5rem)] leading-tight text-ink">
          A dignity-first archive of what didn't work.
        </h2>
        <div className="space-y-5 max-w-[60ch]">
          <p className="font-sans text-[15px] leading-relaxed text-ink-muted">
            Modern digital culture rewards a single shape — the highlight reel.
            The architecture of our public lives is built almost entirely from
            wins. The Museum of Failures rejects that geometry. We recognise
            that the most profound shifts in human character happen not during
            the celebration but in the quiet that follows a collapse.
          </p>
          <p className="font-sans text-[15px] leading-relaxed text-ink-muted">
            This is a digital archive where failures are preserved as
            artifacts. A failed business is treated with the same care as a
            shipped product. An abandoned manuscript is given the same
            spatial dignity as a published one. By cataloguing our regressions
            we grant them the permanence they deserve.
          </p>
          <p className="font-sans text-[15px] leading-relaxed text-ink-muted">
            Preservation is an act of courage. To say "this happened, and it
            matters" is the first step toward a more honest life.
          </p>
        </div>
      </motion.div>

      <motion.aside
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="md:col-span-4 md:col-start-9 border-l border-glass-edge pl-8 self-stretch flex flex-col justify-center"
      >
        <blockquote className="font-display italic text-[clamp(1.25rem,1.6vw,1.5rem)] leading-relaxed text-brass">
          "An emotionally immersive archive where failures, regrets, and
          abandoned dreams are preserved as meaningful artifacts."
        </blockquote>
        <div className="mt-8 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          <span className="block h-px w-8 bg-brass" />
          Office of the Curator
        </div>
      </motion.aside>
    </section>
  );
}

// ---- Feature grid (2x2 offset) ------------------------------------------

function FeatureGrid() {
  const features = [
    {
      number: '001 / ARCHIVE',
      title: 'The Archive',
      body: 'A searchable index of preservations, categorised by category, ending status, and pain index.',
      href: '/exhibits',
      offset: '',
      cta: 'Open the archive',
    },
    {
      number: '002 / ROOMS',
      title: 'Eight Rooms',
      body: 'Themed galleries that group preservations by emotional weight. Each room has its own atmospheric tint.',
      href: '/rooms',
      offset: 'md:mt-12',
      cta: 'Walk the rooms',
    },
    {
      number: '003 / CURATOR',
      title: 'The Curator',
      body: 'A measured AI guide grounded in stoic philosophy. They sit with confessions before reframing them.',
      href: '/curator',
      offset: 'md:-mt-12',
      cta: 'Find the candle',
    },
    {
      number: '004 / CONSTELLATION',
      title: 'Constellation',
      body: "A map of the archive. Distance from the centre reflects pain; clusters map to categories.",
      href: '/constellation',
      offset: '',
      cta: 'View the chart',
    },
  ];

  return (
    <section className="border-t border-glass-edge py-24">
      <Eyebrow>The preservation framework</Eyebrow>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}

interface FeatureCardProps {
  number: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  offset: string;
}

function FeatureCard({ number, title, body, href, cta, offset }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      className={offset}
    >
      <Link
        href={href}
        className="group flex flex-col justify-between bg-paper border border-glass-edge rounded-lg p-10 min-h-[320px] transition-colors hover:border-brass/40"
      >
        <div className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
            {number}
          </span>
          <h3 className="font-display text-[clamp(1.5rem,2vw,2rem)] leading-snug text-ink group-hover:text-brass transition-colors">
            {title}
          </h3>
          <p className="font-sans text-[14px] leading-relaxed text-ink-muted max-w-[44ch]">
            {body}
          </p>
        </div>
        <span className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-brass group-hover:text-brass-deep">
          {cta}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </motion.div>
  );
}

// ---- Closing band --------------------------------------------------------

function ClosingBand() {
  return (
    <section className="border-t border-glass-edge py-24 text-center">
      <EngravedDivider label="// AN INVITATION" />
      <h2 className="mt-12 font-display italic text-[clamp(1.875rem,2.6vw,2.75rem)] leading-tight text-ink max-w-[44ch] mx-auto">
        You are not alone in your failures.
      </h2>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/exhibits/create">
          <Button variant="primary" size="lg">
            Preserve a failure
          </Button>
        </Link>
        <Link
          href="/exhibits"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass transition-colors"
        >
          Or read the archive →
        </Link>
      </div>
      <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
        {'// anonymous contribution welcomed'}
      </p>
    </section>
  );
}
