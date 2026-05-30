'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import type { ExhibitView } from '@museum/shared';
import { api } from '@/lib/api';
import { MuseumNavigation } from '@/components/museum/navigation';
import {
  Eyebrow,
  EngravedDivider,
  ExhibitCard,
  EmptyComposed,
  Button,
} from '@/components/lamplit';
import { useRoomTint, ROOM_TINTS } from '@/components/lamplit-3d';
import { stagger } from '@/lib/motion';

/**
 * Lamplit Archive — Random Walk (`/rooms/random-walk`).
 *
 * Pearl-tinted (#B8B0A0) variant of the room-detail layout. The archive
 * picks ten exhibits at random across all eight rooms; the visitor can
 * "shake the box" any number of times. Cards are laid out 2-per-row,
 * with every second card offset 24px lower for an editorial stagger.
 */
export default function RandomWalkPage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('pearl');
    return () => setRoomTint('brass');
  }, [setRoomTint]);

  const [exhibits, setExhibits] = useState<ExhibitView[]>([]);
  const [loading, setLoading] = useState(true);
  const [walkCount, setWalkCount] = useState(0);

  const loadRandom = useCallback(() => {
    setLoading(true);
    setWalkCount((c) => c + 1);
    api.rooms
      .randomWalk()
      .then((data) => setExhibits(Array.isArray(data) ? (data as ExhibitView[]) : []))
      .catch(() => setExhibits([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRandom();
  }, [loadRandom]);

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <Breadcrumb />

          <Header total={exhibits.length} walkCount={walkCount} />

          <ShuffleBar onShuffle={loadRandom} loading={loading} walkCount={walkCount} />

          <EngravedDivider label="// THIS WALK — TEN EXHIBITS" />

          <section className="mt-16 mb-32">
            {loading ? (
              <SkeletonGrid />
            ) : exhibits.length === 0 ? (
              <EmptyComposed
                title="The corridor was empty this time."
                caption="The archive picked nothing. Shake the box again — the next ten will not be these."
              />
            ) : (
              <StaggeredGrid exhibits={exhibits} />
            )}
          </section>

          <ClosingBand onShuffle={loadRandom} loading={loading} />
        </div>
      </main>
    </>
  );
}

// ---- Sub-pieces ---------------------------------------------------------

function Breadcrumb() {
  return (
    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-whisper mb-12">
      <span>{'// ROOMS / RANDOM WALK'}</span>
      <Link href="/rooms" className="hover:text-brass transition-colors">
        ← Back to all rooms
      </Link>
    </div>
  );
}

function Header({ total, walkCount }: { total: number; walkCount: number }) {
  return (
    <header className="grid grid-cols-1 md:grid-cols-12 gap-12">
      <div className="md:col-span-7">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: ROOM_TINTS.pearl }}
          />
          <Eyebrow tick={false} prefix="">SPECIAL WALK / 01</Eyebrow>
        </div>
        <h1 className="mt-4 font-display italic text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
          Random Walk.
        </h1>
        <p className="mt-4 font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted max-w-[55ch]">
          Ten exhibits, chosen at random across all eight rooms.
        </p>
        <p className="mt-6 font-sans text-[15px] leading-relaxed text-ink-muted max-w-[60ch]">
          The archive will hand you ten preservations it picked itself. The
          selection refreshes whenever you ask. There is no logic to the
          order — the point of a random walk is to walk through what you
          would not have chosen on purpose.
        </p>
      </div>
      <aside className="md:col-span-4 md:col-start-9 self-end">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper space-y-2">
          <Row label="Algorithm" value="uniform random" />
          <Row label="Refresh" value="any time" />
          <Row label="Bias" value="none stated" />
          <Row label="Walks today" value={String(walkCount)} />
          <Row label="Showing" value={String(total)} />
        </div>
      </aside>
    </header>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function ShuffleBar({
  onShuffle,
  loading,
  walkCount,
}: {
  onShuffle: () => void;
  loading: boolean;
  walkCount: number;
}) {
  return (
    <section className="mt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-y border-glass-edge py-6">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper">
        {'// CURRENT WALK · '}
        {walkCount.toString().padStart(2, '0')}
      </span>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onShuffle} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Shuffle and walk again
        </Button>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-whisper hidden md:inline">
          [{walkCount} {walkCount === 1 ? 'walk' : 'walks'} this session]
        </span>
      </div>
    </section>
  );
}

function StaggeredGrid({ exhibits }: { exhibits: ExhibitView[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
    >
      {exhibits.map((exhibit, i) => (
        <div
          key={exhibit.id}
          className={i % 2 === 1 ? 'md:mt-12' : ''}
        >
          <ExhibitCard exhibit={exhibit} index={i} />
        </div>
      ))}
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`${i % 2 === 1 ? 'md:mt-12' : ''} bg-paper border border-glass-edge rounded-lg p-8 min-h-[260px] animate-pulse flex flex-col gap-3`}
        >
          <div className="h-3 w-24 bg-vellum rounded-sm" />
          <div className="h-7 w-3/4 bg-vellum rounded-sm" />
          <div className="h-3 w-full bg-vellum rounded-sm" />
          <div className="h-3 w-5/6 bg-vellum rounded-sm" />
        </div>
      ))}
    </div>
  );
}

function ClosingBand({ onShuffle, loading }: { onShuffle: () => void; loading: boolean }) {
  return (
    <section className="border-t border-glass-edge py-16 text-center">
      <EngravedDivider label="// END OF WALK" />
      <p className="mt-12 font-display italic text-[clamp(1.25rem,1.6vw,1.5rem)] leading-relaxed text-ink max-w-[44ch] mx-auto">
        The walk is over. The archive will pick a different ten if you ask.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button variant="primary" size="md" onClick={onShuffle} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Shuffle ten more
        </Button>
        <Link
          href="/rooms"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass transition-colors"
        >
          Return to the rooms →
        </Link>
      </div>
    </section>
  );
}
