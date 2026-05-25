'use client';

import { useEffect, useState } from 'react';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { ExhibitCard } from '@/components/exhibits/exhibit-card';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import type { ExhibitView } from '@museum/shared';

export default function LastAttemptsPage() {
  const [exhibits, setExhibits] = useState<ExhibitView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.rooms
      .lastAttempts()
      .then((data) => setExhibits(Array.isArray(data) ? (data as ExhibitView[]) : []))
      .catch(() => setExhibits([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MuseumLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="font-serif text-4xl text-whisper-light mb-2">🎯 The Last Attempt</h1>
          <p className="text-whisper-dark font-light">
            Stories of people who went back for one more try.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="museum-card p-5 animate-pulse">
                <div className="h-6 bg-museum-800 rounded w-2/3 mb-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibits.map((exhibit, i) => (
              <ExhibitCard key={exhibit.id} exhibit={exhibit} index={i} />
            ))}
          </div>
        )}
      </div>
    </MuseumLayout>
  );
}
