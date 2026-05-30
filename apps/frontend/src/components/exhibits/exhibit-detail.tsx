'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { ExhibitView } from '@museum/shared';
import { formatDate, getExhibitIdDisplay, getCategoryLabel } from '@/lib/utils';
import { ReactionButtons } from '@/components/emotions/reaction-buttons';
import { ReflectionPanel } from '@/components/ai/reflection-panel';
import { YouAreNotAlone } from '@/components/emotions/you-are-not-alone';
import {
  Eyebrow,
  EngravedDivider,
  TickMarks,
  Tag,
  Button,
} from '@/components/lamplit';
import { fadeUp, stagger } from '@/lib/motion';

// Lazy-loaded: keeps the recursive tree + its motion out of the initial bundle.
const FailureEvolutionTree = dynamic(
  () =>
    import('@/components/exhibits/failure-evolution-tree').then((m) => m.FailureEvolutionTree),
  { ssr: false },
);

// Lazy-loaded: the genome radar/bars + comparison logic only load on demand.
const FailureGenome = dynamic(
  () => import('@/components/exhibits/failure-genome').then((m) => m.FailureGenome),
  { ssr: false },
);

// Lazy-loaded: audio story player + transcript + emotion timeline.
const AudioStory = dynamic(
  () => import('@/components/exhibits/audio-story').then((m) => m.AudioStory),
  { ssr: false },
);

/**
 * Lamplit Archive — Exhibit detail body.
 *
 * Two-panel reading layout: 8/4 split. Left column (8) holds the
 * confession essay (Fraunces, 65ch max), the expectation/reality two-up,
 * the lessons plaque, and the AI reflection panel. Right column (4) is
 * a sticky museum plaque with mono metadata, regret/recovery meters,
 * the engraved-glyph reaction strip, and the "You are not alone" rail.
 */
export function ExhibitDetail({ exhibit }: { exhibit: ExhibitView | null | undefined }) {
  if (!exhibit) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
      <Breadcrumb exhibit={exhibit} />

      <Header exhibit={exhibit} />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <Story exhibit={exhibit} />
        <Plaque exhibit={exhibit} />
      </div>
    </div>
  );
}

// ---- Breadcrumb ---------------------------------------------------------

function Breadcrumb({ exhibit }: { exhibit: ExhibitView }) {
  return (
    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-whisper mb-12">
      <span>
        {'// '}
        <Link href="/exhibits" className="text-ink-muted hover:text-brass transition-colors">Archive</Link>{' '}
        / <span className="text-brass">{getExhibitIdDisplay(exhibit.exhibitId)}</span>
      </span>
      <Link href="/exhibits" className="hover:text-brass transition-colors">
        ← Back to the archive
      </Link>
    </div>
  );
}

// ---- Header --------------------------------------------------------------

function Header({ exhibit }: { exhibit: ExhibitView }) {
  return (
    <motion.header
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end"
    >
      <motion.div variants={fadeUp} className="md:col-span-8">
        <Eyebrow>{getCategoryLabel(exhibit.category)}</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,4vw,3.75rem)] leading-[1.05] tracking-tight text-ink">
          {exhibit.title}
        </h1>
        <div className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
          <Meta label="Preserved" value={formatDate(exhibit.createdAt)} />
          {exhibit.room?.name && <Meta label="Room" value={exhibit.room.name} />}
          <Meta label="Pain" value={`${exhibit.painLevel ?? 0} / 10`} />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="md:col-span-4 md:col-start-9">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-whisper mb-2">
          <span>Pain index</span>
          <span className="text-ink">{exhibit.painLevel ?? 0}/10</span>
        </div>
        <div className="h-px w-full bg-vellum relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-brass transition-all duration-700"
            style={{ width: `${(exhibit.painLevel ?? 0) * 10}%` }}
          />
        </div>
      </motion.div>
    </motion.header>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
        {label}
      </span>
      <span className="font-sans text-[13px] text-ink mt-0.5">{value}</span>
    </div>
  );
}

// ---- Story (left column) ------------------------------------------------

function Story({ exhibit }: { exhibit: ExhibitView }) {
  return (
    <article className="lg:col-span-8 space-y-16">
      <section className="space-y-6">
        <Eyebrow prefix="// 01 / ">The story</Eyebrow>
        <p className="font-display text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink whitespace-pre-wrap max-w-[65ch]">
          {exhibit.story}
        </p>
      </section>

      <EngravedDivider label="// 02 / EXPECTATION VS REALITY" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <Eyebrow tick={false} prefix="">What I expected</Eyebrow>
          <p className="font-sans text-[15px] leading-relaxed text-ink-muted max-w-[42ch]">
            {exhibit.expectedOutcome || 'A silent expectation.'}
          </p>
        </div>
        <div className="space-y-3">
          <Eyebrow tick={false} prefix="">What actually happened</Eyebrow>
          <p className="font-sans text-[15px] leading-relaxed text-ink-muted max-w-[42ch]">
            {exhibit.actualOutcome || 'An unscripted reality.'}
          </p>
        </div>
      </section>

      {exhibit.lessonLearned && (
        <section className="pl-6 border-l-2 border-brass space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
            {'// 03 / Mortality report'}
          </span>
          <blockquote className="font-display italic text-[clamp(1.375rem,1.8vw,1.75rem)] leading-relaxed text-ink">
            "{exhibit.lessonLearned}"
          </blockquote>
        </section>
      )}

      <ReflectionPanel exhibitId={exhibit.id} />

      <FailureEvolutionTree exhibitId={exhibit.id} />

      <FailureGenome exhibitId={exhibit.id} />

      <AudioStory exhibitId={exhibit.id} />
    </article>
  );
}

// ---- Plaque (right column) ----------------------------------------------

function Plaque({ exhibit }: { exhibit: ExhibitView }) {
  return (
    <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-24 self-start">
      <div className="bg-paper border border-glass-edge rounded-lg p-8 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Tag tone="muted">
            Recovery: {(exhibit.recoveryStatus ?? 'unknown').replace(/_/g, ' ')}
          </Tag>
          <Tag tone="brass">
            Ending: {(exhibit.endingStatus ?? 'archived').replace(/_/g, ' ')}
          </Tag>
        </div>

        <Meter
          label="Pain"
          value={exhibit.painLevel ?? 0}
        />
        <Meter
          label="Regret"
          value={exhibit.regretLevel ?? 0}
        />
        <Meter
          label="Recovery progress"
          value={(exhibit.recoveryProgress ?? 0) / 10}
          showPercent
        />

        <ReactionButtons exhibitId={exhibit.id} />
      </div>

      <YouAreNotAlone exhibitId={exhibit.id} />

      <Link href="/exhibits" className="block">
        <Button variant="secondary" size="md" fullWidth>
          <ArrowLeft className="w-4 h-4" /> Return to the archive
        </Button>
      </Link>
    </aside>
  );
}

function Meter({
  label,
  value,
  showPercent = false,
}: {
  label: string;
  value: number;
  showPercent?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          {label}
        </span>
        {showPercent ? (
          <span className="font-mono text-[11px] text-ink">{Math.round(value * 10)}%</span>
        ) : (
          <TickMarks value={value} />
        )}
      </div>
      {showPercent && (
        <div className="h-px w-full bg-vellum relative overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-brass"
            style={{ width: `${Math.max(0, Math.min(100, value * 10))}%` }}
          />
        </div>
      )}
    </div>
  );
}
