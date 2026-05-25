'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExhibitView } from '@museum/shared';
import { api } from '@/lib/api';

export function OneSentenceConfessions() {
  const [confessions, setConfessions] = useState<ExhibitView[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.exhibits
      .oneSentence()
      .then((data) => setConfessions(Array.isArray(data) ? (data as ExhibitView[]) : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (confessions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % confessions.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [confessions.length]);

  if (confessions.length === 0) return null;

  const c = confessions[current];

  return (
    <div className="museum-card p-6 border-ember/10">
      <h3 className="font-serif text-lg text-whisper mb-4">One Sentence Confessions</h3>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          className="min-h-[80px]"
        >
          <p className="text-whisper font-serif text-lg italic leading-relaxed">
            &ldquo;{c?.title || c?.story}&rdquo;
          </p>
          <p className="text-xs text-museum-600 mt-2">
            — Exhibit #{c?.id?.slice(0, 8)}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
