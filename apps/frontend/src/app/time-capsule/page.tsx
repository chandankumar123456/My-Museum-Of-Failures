'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Lock, Unlock, Plus } from 'lucide-react';
import type { CapsulesUserView, TimeCapsuleView } from '@museum/shared';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { MuseumNavigation } from '@/components/museum/navigation';
import {
  Eyebrow,
  EngravedDivider,
  Button,
  EmptyComposed,
} from '@/components/lamplit';
import { TimeCapsuleCreate } from '@/components/time-capsule/capsule-create';
import { useRoomTint } from '@/components/lamplit-3d';
import { fadeUp, stagger } from '@/lib/motion';

/**
 * Lamplit Archive — Time Capsule (`/time-capsule`).
 *
 * Two-column 6/4 split. Left holds Sealed (locked) capsules — paper
 * cards with a brass-soft seal motif. Right holds Unlocked capsules —
 * paper cards with a brass left border, the message rendered as an
 * italic letter excerpt. The visitor can open a Create panel inline.
 */
export default function TimeCapsulePage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

  const { userId } = useAuthStore();
  const [capsules, setCapsules] = useState<CapsulesUserView>({ unlocked: [], locked: [] });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadCapsules = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.timeCapsule.getUser(userId);
      setCapsules(data as CapsulesUserView);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCapsules();
  }, [loadCapsules]);

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
              <CreateBand
                showCreate={showCreate}
                setShowCreate={setShowCreate}
                onCreated={() => {
                  setShowCreate(false);
                  loadCapsules();
                }}
                userId={userId}
              />

              <EngravedDivider label="// THE VAULT" />

              {loading ? (
                <Skeleton />
              ) : (
                <Vault
                  locked={capsules.locked ?? []}
                  unlocked={capsules.unlocked ?? []}
                />
              )}

              <LegacyCallToAction />
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
    <header className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
      <div className="md:col-span-7">
        <Eyebrow>Temporal Vault · 011</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
          Time capsule.
        </h1>
        <p className="mt-6 font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted max-w-[55ch]">
          Messages to your future self. Sealed in the archive until the chosen
          date breaks the seal.
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
      <Lock className="w-8 h-8 text-whisper mx-auto mb-6" strokeWidth={1.5} />
      <p className="font-display italic text-[clamp(1.5rem,2vw,1.875rem)] leading-snug text-ink mb-3">
        The vault recognises only registered archivists.
      </p>
      <p className="font-sans text-[14px] leading-relaxed text-ink-muted mb-8">
        To seal a letter to your future self and read the ones that have already
        opened, sign in to the archive.
      </p>
      <Link href="/auth">
        <Button variant="primary" size="md">
          Sign in or register
        </Button>
      </Link>
    </motion.div>
  );
}

// ---- Create band ---------------------------------------------------------

function CreateBand({
  showCreate,
  setShowCreate,
  onCreated,
  userId,
}: {
  showCreate: boolean;
  setShowCreate: (s: boolean) => void;
  onCreated: () => void;
  userId: string;
}) {
  return (
    <section className="mb-16">
      <div className="bg-paper border border-glass-edge rounded-lg p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-[55ch] space-y-3">
          <Eyebrow>Seal a message</Eyebrow>
          <h2 className="font-display text-[clamp(1.5rem,2vw,2rem)] leading-snug text-ink">
            Write a letter the archive will not open early.
          </h2>
          <p className="font-sans text-[14px] leading-relaxed text-ink-muted">
            Choose a date — next year, five years out, a decade. The archive
            will keep the message sealed until that morning.
          </p>
        </div>
        <Button
          variant={showCreate ? 'secondary' : 'primary'}
          size="md"
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Close the form' : (
            <>
              <Plus className="w-4 h-4" />
              Create a capsule
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden"
          >
            <TimeCapsuleCreate userId={userId} onSuccess={onCreated} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ---- Vault columns -------------------------------------------------------

function Vault({
  locked,
  unlocked,
}: {
  locked: TimeCapsuleView[];
  unlocked: TimeCapsuleView[];
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-12">
      {/* Locked column (60%) */}
      <div className="md:col-span-7">
        <div className="flex items-baseline justify-between mb-6">
          <Eyebrow>Sealed · {locked.length}</Eyebrow>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
            Awaiting unlock
          </span>
        </div>
        {locked.length === 0 ? (
          <EmptyComposed
            title="No sealed letters."
            caption="Nothing is waiting in the future yet — the vault is rested."
          />
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {locked.map((capsule) => (
              <SealedCard key={capsule.id} capsule={capsule} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Unlocked column (40%) */}
      <div className="md:col-span-5">
        <div className="flex items-baseline justify-between mb-6">
          <Eyebrow>Opened · {unlocked.length}</Eyebrow>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
            Ready to read
          </span>
        </div>
        {unlocked.length === 0 ? (
          <EmptyComposed
            title="None opened yet."
            caption="Letters from the past will appear here on their unlock date."
          />
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {unlocked.map((capsule) => (
              <OpenedCard key={capsule.id} capsule={capsule} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function SealedCard({ capsule }: { capsule: TimeCapsuleView }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-paper border border-glass-edge rounded-md p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="space-y-2">
        <h4 className="font-display text-[1.125rem] leading-snug text-ink">{capsule.title}</h4>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-whisper">
          <Calendar className="w-3.5 h-3.5" />
          Sealed
        </div>
      </div>
      <div className="bg-brass-soft border border-brass/30 rounded-sm px-3 py-2 flex items-center gap-2 self-start sm:self-auto">
        <Lock className="w-3.5 h-3.5 text-brass" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass-deep">
          Unlocks {formatDate(capsule.unlockDate)}
        </span>
      </div>
    </motion.div>
  );
}

function OpenedCard({ capsule }: { capsule: TimeCapsuleView }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-paper border border-glass-edge border-l-2 border-l-brass rounded-md p-6 space-y-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="font-display text-[1.125rem] leading-snug text-ink">{capsule.title}</h4>
        {capsule.openedAt && (
          <span className="font-mono text-[10px] tracking-tight text-whisper shrink-0">
            {formatDate(capsule.openedAt)}
          </span>
        )}
      </div>
      <p className="font-display italic text-[15px] leading-relaxed text-ink-muted border-l border-glass-edge pl-4">
        "{capsule.message}"
      </p>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
        <Unlock className="w-3.5 h-3.5" /> Seal broken on {formatDate(capsule.openedAt ?? capsule.unlockDate)}
      </div>
    </motion.div>
  );
}

// ---- Skeleton ------------------------------------------------------------

function Skeleton() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-12 animate-pulse">
      <div className="md:col-span-7 space-y-4">
        <div className="h-3 w-32 bg-vellum rounded-sm" />
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-24 bg-paper border border-glass-edge rounded-md"
          />
        ))}
      </div>
      <div className="md:col-span-5 space-y-4">
        <div className="h-3 w-32 bg-vellum rounded-sm" />
        <div className="h-40 bg-paper border border-glass-edge rounded-md" />
      </div>
    </section>
  );
}

// ---- Legacy CTA ----------------------------------------------------------

function LegacyCallToAction() {
  return (
    <section className="mt-24 bg-paper border border-glass-edge rounded-lg p-12 md:p-16 text-center">
      <Eyebrow>Legacy · 012</Eyebrow>
      <h2 className="mt-4 font-display text-[clamp(1.5rem,2vw,2rem)] leading-snug text-ink max-w-[55ch] mx-auto">
        Some failures deserve a permanent plaque on the wall.
      </h2>
      <p className="mt-6 font-sans text-[15px] leading-relaxed text-ink-muted max-w-[55ch] mx-auto">
        Pin one of your preservations as your legacy exhibit — a single
        artifact representing what shaped you. Only one at a time.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/legacy">
          <Button variant="primary" size="md">
            Choose a legacy exhibit
          </Button>
        </Link>
        <Link
          href="/exhibits/create"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass transition-colors"
        >
          Or preserve a new failure →
        </Link>
      </div>
    </section>
  );
}
