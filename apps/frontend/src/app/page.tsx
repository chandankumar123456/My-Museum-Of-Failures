'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MuseumNavigation } from '@/components/museum/navigation';
import { Button, Eyebrow, EngravedDivider, Parallax } from '@/components/lamplit';
import { SetPiece, LandingHeroSetPiece, useRoomTint } from '@/components/lamplit-3d';
import { fadeUp, stagger, SPRING } from '@/lib/motion';
import { useEffect } from 'react';

/**
 * Lamplit Archive — Landing page (`/`).
 *
 * Bright editorial hero anchored by the brass-lamp + drawer set piece in
 * the shared 3D canvas. Asymmetric 60/40 hero, restrained two-tier
 * editorial sections, no fake stats, no stock-image hero, no scroll
 * arrows. Copy is restrained and museum-voiced.
 */
export default function HomePage() {
  const { setRoomTint } = useRoomTint();

  // Landing has no per-room tint — use brass (the global default).
  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

  return (
    <>
      {/* Layer 3 set piece registers itself with the shared canvas. */}
      <SetPiece>
        <LandingHeroSetPiece />
      </SetPiece>

      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <HeroSection />
          <PhilosophyBand />
          <AnatomySection />
          <NewAtTheMuseum />
          <CuratorPullquote />
          <PreservationPhilosophy />
        </div>
        <Footer />
      </main>
    </>
  );
}

// ---- Hero ---------------------------------------------------------------

function HeroSection() {
  return (
    <section className="min-h-[calc(100dvh-4rem)] grid grid-cols-1 md:grid-cols-12 gap-12 items-center py-24 md:py-32">
      <Parallax offset={28} className="md:col-span-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-start"
      >
        <motion.div variants={fadeUp} className="mb-8">
          <Eyebrow>Archive No. 001</Eyebrow>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[1.05] tracking-tight text-ink mb-8"
        >
          A museum of what <span className="italic">didn't</span> work.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="font-display text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted max-w-[55ch] mb-12"
        >
          This space exists to preserve the quiet collapse, the abandoned draft,
          and the heavy silences. Here, failure is not a stepping stone to
          success — it is a definitive artifact of a human life, worthy of its
          own pedestal.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-6 items-center">
          <Link href="/exhibits">
            <Button variant="primary" size="lg">
              Enter the archive
            </Button>
          </Link>
          <Link
            href="/about"
            className="font-sans text-sm font-medium text-ink border-b border-brass/40 hover:border-brass transition-colors pb-0.5"
          >
            Read the manifesto
          </Link>
        </motion.div>
      </motion.div>
      </Parallax>

      {/* Right column intentionally blank — the LandingHeroSetPiece
          renders into the shared canvas behind this column. We reserve
          the space so the layout doesn't collapse on mobile. */}
      <Parallax offset={64} className="relative md:col-span-6 hidden md:block">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SPRING, delay: 0.2 }}
        className="relative min-h-[420px]"
        aria-hidden
      >
        <div className="absolute right-0 bottom-8 font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          Fig. 1 — The Desk of Lost Attempts
        </div>
      </motion.div>
      </Parallax>
    </section>
  );
}

// ---- Philosophy Band -----------------------------------------------------

function PhilosophyBand() {
  return (
    <section className="py-24 border-y border-glass-edge">
      <div className="max-w-[65ch]">
        <Eyebrow>The archive is honest</Eyebrow>
        <p className="mt-6 font-display italic text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.35] text-ink">
          We spend our lives curating the highlights. The Museum of Failures is
          the reverse — a dignity-first repository for the regrets and missteps
          that actually shape our interior architecture. Here, we stop hiding
          and start observing.
        </p>
      </div>
    </section>
  );
}

// ---- Anatomy of the Archive (asymmetric 2+1 grid) -----------------------

function AnatomySection() {
  return (
    <section id="anatomy" className="py-24">
      <div className="mb-16 flex items-end justify-between gap-8 flex-wrap">
        <div>
          <Eyebrow>Collection Index</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(2rem,3vw,3rem)] leading-tight text-ink">
            The anatomy of an archive.
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          Three entry points
        </span>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <FeatureCard
          number="001 / EXHIBITS"
          title="Preserved Exhibits"
          body="Browse the permanent collection — each piece documented with its original intent, the moment of collapse, and the lessons extracted from the debris."
          href="/exhibits"
          cta="View collection"
          large
        />
        <FeatureCard
          number="002 / SPACES"
          title="Museum Rooms"
          body="Eight curated rooms grouping failures by emotional origin — ambition, timing, heart, recovery — each with its own atmosphere."
          href="/rooms"
          cta="Browse rooms"
        />
        <FeatureCard
          number="003 / RECORDS"
          title="The Time Capsule"
          body="Seal a message to your future self. The archive remembers — and on the chosen date, the seal breaks open."
          href="/time-capsule"
          cta="Open capsules"
        />
      </motion.div>
    </section>
  );
}

interface FeatureCardProps {
  number: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  large?: boolean;
}

function FeatureCard({ number, title, body, href, cta, large = false }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className={`${large ? 'md:col-span-2' : ''} flex`}
    >
      <Link
        href={href}
        className="group flex-1 flex flex-col justify-between bg-paper border border-glass-edge rounded-lg p-8 md:p-10 min-h-[280px] transition-colors hover:border-brass/40"
      >
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
            {number}
          </span>
          <h3 className="mt-4 font-display text-[clamp(1.5rem,1.8vw,2rem)] leading-snug text-ink">
            {title}
          </h3>
          <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink-muted max-w-[42ch]">
            {body}
          </p>
        </div>
        <span className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-brass group-hover:text-brass-deep flex items-center gap-2">
          {cta}
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

// ---- New at the museum ---------------------------------------------------

function NewAtTheMuseum() {
  return (
    <section className="py-24 border-t border-glass-edge">
      <div className="mb-16">
        <Eyebrow>New at the museum</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(2rem,3vw,3rem)] leading-tight text-ink">
          New ways to read a failure.
        </h2>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <FeatureCard
          number="NEW / CURATORS"
          title="Five curators, one failure"
          body="Open any exhibit and read it through five minds — the Historian, Engineer, Therapist, Founder, and Philosopher. Each offers its own reflection on the same story."
          href="/exhibits"
          cta="Open the archive"
        />
        <FeatureCard
          number="NEW / EVOLUTION"
          title="Failures that evolve"
          body="A failure is rarely the end. Link each attempt to the one before it — Attempt, Pivot, Recovery — and the lineage grows into an evolution tree with recovery metrics on the exhibit page."
          href="/exhibits/create"
          cta="Preserve a continuation"
        />
        <FeatureCard
          number="NEW / GENOME"
          title="A failure's DNA"
          body="Every exhibit is profiled into a genome — eight practical traits and six emotional ones, drawn as a radar and bars. Compare any two failures to see how alike they really are."
          href="/exhibits"
          cta="Read the genome"
        />
        <FeatureCard
          number="NEW / CONSTELLATION"
          title="A map of every failure"
          body="The archive is a knowledge graph. Failures become stars; shared emotions, lessons, causes, and journeys become the lines between them. Zoom, search, and follow the threads."
          href="/constellation"
          cta="Enter the constellation"
        />
        <FeatureCard
          number="NEW / AUDIO"
          title="Failures in their own voice"
          body="Record or upload a spoken confession. The archive transcribes it, summarises it, and traces the emotional arc of the telling — hope to frustration to acceptance."
          href="/exhibits"
          cta="Add an audio story"
        />
      </motion.div>
    </section>
  );
}

// ---- Curator pull-quote --------------------------------------------------

function CuratorPullquote() {
  return (
    <section className="py-32">
      <EngravedDivider label="// CURATORIAL NOTE" />
      <div className="max-w-[55ch] mx-auto text-center mt-16">
        <blockquote className="font-display italic text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.4] text-ink">
          "The goal is not motivation culture or toxic positivity. The goal is
          emotional honesty."
        </blockquote>
        <cite className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-whisper not-italic">
          — The Curator
        </cite>
      </div>
    </section>
  );
}

// ---- Preservation Philosophy --------------------------------------------

function PreservationPhilosophy() {
  return (
    <section className="py-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-start border-t border-glass-edge">
      <div className="md:col-span-5 space-y-6">
        <Eyebrow>Preservation philosophy</Eyebrow>
        <h2 className="font-display text-[clamp(1.875rem,2.4vw,2.5rem)] leading-tight text-ink">
          A new way to remember.
        </h2>
        <p className="font-sans text-[15px] leading-relaxed text-ink-muted">
          Modern digital culture demands a constant stream of "wins." The
          Museum of Failures fills the gap, documenting the projects that
          never launched, the relationships that dissolved, and the ideas
          that were too early for their time.
        </p>
      </div>
      <div className="md:col-span-6 md:col-start-7 space-y-8 border-l border-glass-edge pl-8">
        <PhilosophyItem
          title="Curated honesty"
          body="Raw, unedited accounts contributed by the global community. No glossing, no framing as triumph."
        />
        <PhilosophyItem
          title="Safe observation"
          body="Examine the missteps from a measured distance. Reactions are engraved glyphs — not popularity counters."
        />
        <PhilosophyItem
          title="Dignity by default"
          body="Each preservation is an artifact, not a trauma feed. The chrome is bright; the content is what carries the weight."
        />
      </div>
    </section>
  );
}

function PhilosophyItem({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">{title}</h4>
      <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

// ---- Footer --------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-glass-edge mt-16">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-display text-lg text-ink">Museum of Failures</span>
          <p className="font-sans text-[13px] text-ink-muted max-w-xs">
            Preserving the beauty of what didn't work.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-whisper">
          <Link href="/about" className="hover:text-brass transition-colors">
            About
          </Link>
          <Link href="/exhibits" className="hover:text-brass transition-colors">
            Archive
          </Link>
          <Link href="/rooms" className="hover:text-brass transition-colors">
            Rooms
          </Link>
          <Link href="/curator" className="hover:text-brass transition-colors">
            Curator
          </Link>
          <Link href="/constellation" className="hover:text-brass transition-colors">
            Constellation
          </Link>
        </nav>
      </div>
    </footer>
  );
}
