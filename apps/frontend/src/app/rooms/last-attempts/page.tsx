'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ExhibitView } from '@museum/shared';
import { api } from '@/lib/api';
import { MuseumNavigation } from '@/components/museum/navigation';
import {
  Eyebrow,
  EngravedDivider,
  ExhibitCard,
  EmptyComposed,
  Button,
  Tag,
} from '@/components/lamplit';
import { useRoomTint, ROOM_TINTS } from '@/components/lamplit-3d';
import { stagger } from '@/lib/motion';

/**
 * Lamplit Archive — Last Attempts (`/rooms/last-attempts`).
 *
 * Amber-tinted (#B98A4D) variant of the room-detail layout. Lists the
 * preservations whose archivist marked "would retry" — failures with
 * retry intent. Filterable into RESOLVED / STILL OPEN. Cards stagger
 * 2-per-row for the editorial rhythm.
 */
type Filter = 'all' | 'resolved' | 'open';

export default function LastAttemptsPage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('amber');
    return () => setRoomTint('brass');
  }, [setRoomTint]);

  const [exhibits, setExhibits] = useState<ExhibitView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    setLoading(true);
    api.rooms
      .lastAttempts()
      .then((data) => setExhibits(Array.isArray(data) ? (data as ExhibitView[]) : []))
      .catch(() => setExhibits([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const resolved = exhibits.filter((e) => e.recoveryStatus === 'recovered' || e.recoveryStatus === 'retried').length;
    const open = exhibits.length - resolved;
    return { all: exhibits.length, resolved, open };
  }, [exhibits]);

  const filtered = useMemo(() => {
    if (filter === 'resolved') {
      return exhibits.filter((e) => e.recoveryStatus === 'recovered' || e.recoveryStatus === 'retried');
    }
    if (filter === 'open') {
      return exhibits.filter((e) => e.recoveryStatus !== 'recovered' && e.recoveryStatus !== 'retried');
    }
    return exhibits;
  }, [filter, exhibits]);

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <Breadcrumb />

          <Header counts={counts} />

          <FilterBar filter={filter} setFilter={setFilter} counts={counts} />

          <EngravedDivider label={`// ${filtered.length} EXHIBITS WITH RETRY INTENT`} />

          <section className="mt-16 mb-32">
            {loading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <EmptyComposed
                title="No retry intent on this page yet."
                caption="No archivist has marked a preservation here as 'would retry.' That, too, is a kind of stillness."
              />
            ) : (
              <StaggeredGrid exhibits={filtered} />
            )}
          </section>

          <ClosingBand />
        </div>
      </main>
    </>
  );
}

// ---- Sub-pieces ---------------------------------------------------------

function Breadcrumb() {
  return (
    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-whisper mb-12">
      <span>{'// ROOMS / LAST ATTEMPTS'}</span>
      <Link href="/rooms" className="hover:text-brass transition-colors">
        ← Back to all rooms
      </Link>
    </div>
  );
}

function Header({ counts }: { counts: { all: number; resolved: number; open: number } }) {
  return (
    <header className="grid grid-cols-1 md:grid-cols-12 gap-12">
      <div className="md:col-span-7">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: ROOM_TINTS.amber }}
          />
          <Eyebrow tick={false} prefix="">SPECIAL WALK / 02</Eyebrow>
        </div>
        <h1 className="mt-4 font-display italic text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
          Last Attempts.
        </h1>
        <p className="mt-4 font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted max-w-[55ch]">
          Exhibits where someone wanted to try one more time.
        </p>
        <p className="mt-6 font-sans text-[15px] leading-relaxed text-ink-muted max-w-[60ch]">
          These are the failures that have not yet ended. The archivist who
          preserved each of these checked a small box: "I would do this again,
          if I could." The box is private — the intention behind it is what
          gathers them here.
        </p>
      </div>
      <aside className="md:col-span-4 md:col-start-9 self-end">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper space-y-2">
          <Row label="Total" value={`${counts.all} retry-tagged`} />
          <Row label="Resolved" value={String(counts.resolved)} />
          <Row label="Still open" value={String(counts.open)} />
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

function FilterBar({
  filter,
  setFilter,
  counts,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
  counts: { all: number; resolved: number; open: number };
}) {
  return (
    <section className="mt-16 border-y border-glass-edge py-6">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper">
          {'// FILTER BY OUTCOME'}
        </span>
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label={`ALL ${counts.all}`}
        />
        <span className="font-mono text-whisper">·</span>
        <FilterChip
          active={filter === 'resolved'}
          onClick={() => setFilter('resolved')}
          label={`RETRIED, RESOLVED — ${counts.resolved}`}
        />
        <span className="font-mono text-whisper">·</span>
        <FilterChip
          active={filter === 'open'}
          onClick={() => setFilter('open')}
          label={`STILL OPEN — ${counts.open}`}
        />
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button onClick={onClick}>
      <Tag tone={active ? 'brass' : 'muted'} interactive>
        {label}
      </Tag>
    </button>
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
        <div key={exhibit.id} className={i % 2 === 1 ? 'md:mt-12' : ''}>
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

function ClosingBand() {
  return (
    <section className="border-t border-glass-edge py-16 text-center">
      <EngravedDivider label="// AT THE END OF THE LIST" />
      <p className="mt-12 font-display italic text-[clamp(1.25rem,1.6vw,1.5rem)] leading-relaxed text-ink max-w-[55ch] mx-auto">
        Some failures stay open on purpose. Some close themselves. Both are honest.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/exhibits/create">
          <Button variant="outline" size="md">
            Mark one of yours as "would retry"
          </Button>
        </Link>
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
