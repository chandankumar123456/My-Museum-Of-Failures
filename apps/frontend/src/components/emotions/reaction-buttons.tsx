'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionalReaction } from '@museum/shared';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { ReactionGlyph, REACTION_LABELS, Eyebrow } from '@/components/lamplit';
import { fadeUp, stagger } from '@/lib/motion';

/**
 * Lamplit Archive — ReactionButtons.
 *
 * Each reaction is rendered as an engraved-glyph button: small SVG line
 * icon + caps label + count. The active state fills with brass-soft and
 * locks the button. No emoji, no rounded pills.
 */

interface ReactionButtonsProps {
  exhibitId: string;
  counts?: Partial<Record<EmotionalReaction, number>>;
}

const ALL_REACTIONS: EmotionalReaction[] = [
  EmotionalReaction.I_RELATE,
  EmotionalReaction.I_SURVIVED_THIS_TOO,
  EmotionalReaction.STILL_RECOVERING,
  EmotionalReaction.THIS_HURT,
  EmotionalReaction.YOU_WERE_BRAVE,
  EmotionalReaction.I_UNDERSTAND,
];

// Stable reference so the default prop doesn't create a new object each render
// (which would make the counts-sync effect loop infinitely).
const EMPTY_COUNTS: Partial<Record<EmotionalReaction, number>> = {};

export function ReactionButtons({ exhibitId, counts = EMPTY_COUNTS }: ReactionButtonsProps) {
  const { userId } = useAuthStore();
  const [localCounts, setLocalCounts] =
    useState<Partial<Record<EmotionalReaction, number>>>(counts);
  const [reacted, setReacted] = useState<Set<EmotionalReaction>>(new Set());

  useEffect(() => setLocalCounts(counts), [counts]);

  const handleReact = async (reaction: EmotionalReaction) => {
    if (reacted.has(reaction)) return;
    try {
      await api.emotions.react(exhibitId, reaction, userId ?? undefined);
      setLocalCounts((prev) => ({ ...prev, [reaction]: (prev[reaction] || 0) + 1 }));
      setReacted((prev) => new Set(prev).add(reaction));
    } catch {
      // Silent fail — reactions are non-critical UX.
    }
  };

  return (
    <section className="space-y-4">
      <Eyebrow>Record your reaction</Eyebrow>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-2"
      >
        {ALL_REACTIONS.map((r) => {
          const isActive = reacted.has(r);
          const count = localCounts[r] ?? 0;
          return (
            <motion.button
              key={r}
              variants={fadeUp}
              onClick={() => handleReact(r)}
              disabled={isActive}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-left transition-colors ${
                isActive
                  ? 'border-brass bg-brass-soft text-brass cursor-default'
                  : 'border-glass-edge text-ink-muted hover:border-brass/60 hover:text-brass'
              }`}
            >
              <span className="flex items-center gap-2">
                <ReactionGlyph reaction={r} active={isActive} />
                <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
                  {REACTION_LABELS[r]}
                </span>
              </span>
              {count > 0 && (
                <span className={`font-mono text-[11px] ${isActive ? 'text-brass-deep' : 'text-whisper'}`}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
