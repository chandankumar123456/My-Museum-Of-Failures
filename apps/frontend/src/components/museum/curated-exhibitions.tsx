'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { CuratedExhibitionView } from '@museum/shared';
import { api } from '@/lib/api';

export function CuratedExhibitions() {
  const [exhibitions, setExhibitions] = useState<CuratedExhibitionView[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.ai
      .curatedExhibitions()
      .then((data) =>
        setExhibitions(Array.isArray(data) ? (data as CuratedExhibitionView[]) : []),
      )
      .catch(() => {});
  }, []);

  if (exhibitions.length === 0) return null;

  const exhibition = exhibitions[current];

  return (
    <div className="museum-card p-6 border-ember/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-whisper">Curated Exhibition</h3>
        <div className="flex gap-1">
          {exhibitions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? 'bg-ember' : 'bg-museum-800'
              }`}
              aria-label={`Switch to exhibition ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="text-xl text-whisper-light font-serif mb-1">{exhibition.title}</h4>
          <p className="text-sm text-whisper-dark mb-4">{exhibition.description}</p>

          <div className="space-y-2">
            {exhibition.exhibits?.slice(0, 3).map((exhibit) => (
              <Link
                key={exhibit.id}
                href={`/exhibits/${exhibit.id}`}
                className="block p-3 rounded-sm border border-museum-800 hover:border-ember/30 transition-colors"
              >
                <div className="text-sm text-whisper truncate">{exhibit.title}</div>
              </Link>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
