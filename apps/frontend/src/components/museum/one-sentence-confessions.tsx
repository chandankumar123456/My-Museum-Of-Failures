'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OneSentenceConfession {
  id: string;
  title: string;
  story: string;
  createdAt: string;
}

export function OneSentenceConfessions() {
  const [confessions, setConfessions] = useState<OneSentenceConfession[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/exhibits/one-sentence`)
      .then((r) => r.json())
      .then((data) => setConfessions(Array.isArray(data) ? data : []))
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
            &ldquo;{confessions[current]?.title || confessions[current]?.story}&rdquo;
          </p>
          <p className="text-xs text-museum-600 mt-2">
            — Exhibit #{confessions[current]?.id?.slice(0, 8)}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
