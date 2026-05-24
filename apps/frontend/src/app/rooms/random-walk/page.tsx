'use client';

import { useEffect, useState } from 'react';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { ExhibitCard } from '@/components/exhibits/exhibit-card';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

export default function RandomWalkPage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRandom = () => {
    setLoading(true);
    api.rooms.randomWalk()
      .then((data) => setExhibits(Array.isArray(data) ? data : []))
      .catch(() => setExhibits([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRandom(); }, []);

  return (
    <MuseumLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="font-serif text-4xl text-whisper-light mb-2">Random Museum Walk</h1>
          <p className="text-whisper-dark font-light mb-4">
            Let fate guide you through the archives.
          </p>
          <button
            onClick={loadRandom}
            className="px-4 py-2 border border-museum-800 rounded-sm text-sm text-whisper-dark hover:border-ember/50 transition-colors"
          >
            Walk Again
          </button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="museum-card p-5 animate-pulse">
                <div className="h-4 bg-museum-800 rounded w-1/3 mb-3" />
                <div className="h-6 bg-museum-800 rounded w-2/3 mb-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibits.map((exhibit: any, i: number) => (
              <ExhibitCard key={exhibit.id} exhibit={exhibit} index={i} />
            ))}
          </div>
        )}
      </div>
    </MuseumLayout>
  );
}
