'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { REACTIONS } from '@/lib/constants';
import { api } from '@/lib/api';

interface ReactionButtonsProps {
  exhibitId: string;
  counts?: Record<string, number>;
}

export function ReactionButtons({ exhibitId, counts = {} }: ReactionButtonsProps) {
  const [localCounts, setLocalCounts] = useState<Record<string, number>>(counts);
  const [reacted, setReacted] = useState<Set<string>>(new Set());

  const handleReact = async (reaction: string) => {
    if (reacted.has(reaction)) return;

    try {
      await api.emotions.react(exhibitId, reaction);
      setLocalCounts((prev) => ({
        ...prev,
        [reaction]: (prev[reaction] || 0) + 1,
      }));
      setReacted((prev) => new Set(prev).add(reaction));
    } catch {
      // Silent fail for reactions
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-museum-600 uppercase tracking-wider font-mono">
        How does this make you feel?
      </p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((r, i) => (
          <motion.button
            key={r.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleReact(r.value)}
            disabled={reacted.has(r.value)}
            className={`group relative px-3 py-2 rounded-sm border text-sm transition-all duration-300 ${
              reacted.has(r.value)
                ? 'border-ember bg-ember/20 text-ember'
                : 'border-museum-800 text-whisper-dark hover:border-ember/50 hover:text-whisper'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{r.symbol}</span>
              <span className="hidden md:inline">{r.label}</span>
              {localCounts[r.value] > 0 && (
                <span className="text-xs text-museum-600">{localCounts[r.value]}</span>
              )}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
