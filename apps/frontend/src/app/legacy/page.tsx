'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import type { ExhibitView, ExhibitListView } from '@museum/shared';
import { MuseumNavigation } from '@/components/museum/navigation';
import {
  Eyebrow,
  EngravedDivider,
  Button,
  EmptyComposed,
  ExhibitCard,
} from '@/components/lamplit';
import { useRoomTint } from '@/components/lamplit-3d';
import { fadeUp, stagger } from '@/lib/motion';

/**
 * Lamplit Archive — Legacy Vault (`/legacy`).
 *
 * One pinned exhibit at a time. The current legacy is spotlit at the top
 * (paper card with brass border + brass plaque badge). Below, a list of
 * candidate exhibits the visitor can pin from.
 */
export default function LegacyPage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

  const { userId } = useAuthStore();
  const [legacy, setLegacy] = useState<ExhibitView | null>(null);
  const [exhibits, setExhibits] = useState<ExhibitView[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinning, setPinning] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      api.timeCapsule.getLegacy(userId).catch(() => null),
      api.exhibits.list('limit=20').catch(() => ({ exhibits: [], total: 0 }) as ExhibitListView),
    ])
      .then(([legacyExhibit, list]) => {
        setLegacy((legacyExhibit as ExhibitView | null) ?? null);
        setExhibits(((list as ExhibitListView).exhibits ?? []) as ExhibitView[]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const pinAsLegacy = async (exhibitId: string) => {
    if (!userId) return;
    setPinning(exhibitId);
    try {
      await api.timeCapsule.setLegacy(userId, exhibitId);
      const updated = await api.timeCapsule.getLegacy(userId);
      setLegacy((updated as ExhibitView | null) ?? null);
    } finally {
      setPinning(null);
    }
  };

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <Header />

          {!userId ? (
            <SignInGate />
          ) : (
            <>
              <CurrentLegacy legacy={legacy} loading={loading} />

              <EngravedDivider label="// PIN A LEGACY" />

              <section className="mt-12">
                {loading ? (
                  <SkeletonGrid />
                ) : exhibits.length === 0 ? (
                  <EmptyComposed
                    title="No exhibits to pin yet."
                    caption="Preserve a failure first — then return here to choose your legacy."
                    action={
                      <Link href="/exhibits/create">
                        <Button variant="primary" size="md">
                          Preserve a failure
                        </Button>
                      </Link>
                    }
                  />
                ) : (
                  <CandidateGrid
                    exhibits={exhibits}
                    legacyId={legacy?.id ?? null}
                    pinning={pinning}
                    onPin={pinAsLegacy}
                  />
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

// ---- Header --------------------------------------------------------------

function Header() {
  return (
    <header className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
      <div className="md:col-span-7">
        <Eyebrow>Legacy Vault · 012</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
          One artifact, kept forever.
        </h1>
        <p className="mt-6 font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted max-w-[55ch]">
          Choose one of your preservations as a permanent plaque on the wall.
          The rest of the archive may quietly retire — your legacy will not.
        </p>
      </div>
    </header>
  );
}

// ---- Sign-in gate --------------------------------------------------------

function SignInGate() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="max-w-xl mx-auto bg-paper border border-glass-edge rounded-lg p-12 text-center"
    >
      <p className="font-display italic text-[clamp(1.5rem,2vw,1.875rem)] text-ink mb-3">
        Only registered archivists may pin a legacy.
      </p>
      <p className="font-sans text-[14px] leading-relaxed text-ink-muted mb-8">
        Anonymous visitors can read and preserve, but the legacy plaque needs
        a name to engrave.
      </p>
      <Link href="/auth">
        <Button variant="primary" size="md">
          Sign in or register
        </Button>
      </Link>
    </motion.div>
  );
}

// ---- Current legacy ------------------------------------------------------

function CurrentLegacy({
  legacy,
  loading,
}: {
  legacy: ExhibitView | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-paper border border-glass-edge rounded-lg p-8 mb-16 animate-pulse h-32" />
    );
  }

  return (
    <section className="mb-16">
      <Eyebrow>Currently pinned</Eyebrow>
      {legacy ? (
        <Link
          href={`/exhibits/${legacy.id}`}
          className="block mt-4 bg-paper border border-brass/60 rounded-lg p-8 md:p-10 transition-colors hover:border-brass"
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
                Plaque · {(legacy.endingStatus ?? 'archived').replace(/_/g, ' ')}
              </span>
              <h2 className="mt-3 font-display text-[clamp(1.75rem,2.4vw,2.5rem)] leading-snug text-ink">
                {legacy.title}
              </h2>
              {legacy.lessonLearned && (
                <p className="mt-4 font-display italic text-[clamp(1rem,1.2vw,1.125rem)] leading-relaxed text-ink-muted max-w-[55ch]">
                  "{legacy.lessonLearned}"
                </p>
              )}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass shrink-0 self-start inline-flex items-center">
              <span className="brass-tick" aria-hidden />
              Legacy
            </span>
          </div>
        </Link>
      ) : (
        <p className="mt-4 font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] text-ink-muted">
          No legacy chosen yet. Pin one of your exhibits below.
        </p>
      )}
    </section>
  );
}

// ---- Candidate grid ------------------------------------------------------

function CandidateGrid({
  exhibits,
  legacyId,
  pinning,
  onPin,
}: {
  exhibits: ExhibitView[];
  legacyId: string | null;
  pinning: string | null;
  onPin: (id: string) => void;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {exhibits.map((exhibit, i) => {
        const isPinned = legacyId === exhibit.id;
        const isPinning = pinning === exhibit.id;
        return (
          <div key={exhibit.id} className="relative">
            <ExhibitCard exhibit={exhibit} index={i} />
            <button
              onClick={() => onPin(exhibit.id)}
              disabled={isPinned || isPinning}
              className={`absolute top-4 right-4 px-3 py-1.5 rounded-sm font-mono text-[10px] uppercase tracking-[0.16em] transition-colors border ${
                isPinned
                  ? 'border-brass bg-brass-soft text-brass cursor-default'
                  : 'border-glass-edge bg-paper text-ink-muted hover:border-brass hover:text-brass'
              } disabled:opacity-50`}
            >
              {isPinned ? (
                <span className="inline-flex items-center"><span className="brass-tick" aria-hidden />Pinned</span>
              ) : isPinning ? 'Pinning…' : 'Pin'}
            </button>
          </div>
        );
      })}
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-paper border border-glass-edge rounded-lg p-8 min-h-[260px] animate-pulse flex flex-col gap-3"
        >
          <div className="h-3 w-24 bg-vellum rounded-sm" />
          <div className="h-7 w-3/4 bg-vellum rounded-sm" />
          <div className="h-3 w-full bg-vellum rounded-sm" />
        </div>
      ))}
    </div>
  );
}
