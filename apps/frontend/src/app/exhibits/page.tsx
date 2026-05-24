'use client';

import { useEffect, useState } from 'react';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { ExhibitCard } from '@/components/exhibits/exhibit-card';
import { api } from '@/lib/api';
import { CATEGORIES, ENDING_STATUSES } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function ExhibitsPage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [endingStatus, setEndingStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (endingStatus) params.set('endingStatus', endingStatus);
    if (search) params.set('search', search);
    params.set('limit', '50');

    api.exhibits.list(params.toString())
      .then((data) => setExhibits(data.exhibits || []))
      .catch(() => setExhibits([]))
      .finally(() => setLoading(false));
  }, [category, endingStatus, search]);

  return (
    <MuseumLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl text-whisper-light mb-2"
          >
            The Archive
          </motion.h1>
          <p className="text-whisper-dark font-light">
            Preserved failures. Each one is a story someone chose not to hide.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search exhibits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-void border border-museum-800 rounded-sm px-4 py-2 text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-void border border-museum-800 rounded-sm px-3 py-2 text-whisper-dark text-sm focus:border-ember/50 focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
            ))}
          </select>

          <select
            value={endingStatus}
            onChange={(e) => setEndingStatus(e.target.value)}
            className="bg-void border border-museum-800 rounded-sm px-3 py-2 text-whisper-dark text-sm focus:border-ember/50 focus:outline-none"
          >
            <option value="">All Endings</option>
            {ENDING_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="museum-card p-5 animate-pulse">
                <div className="h-4 bg-museum-800 rounded w-1/3 mb-3" />
                <div className="h-6 bg-museum-800 rounded w-2/3 mb-4" />
                <div className="h-4 bg-museum-800 rounded w-full mb-2" />
                <div className="h-4 bg-museum-800 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : exhibits.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-museum-600 font-serif text-xl">The archive is empty.</p>
            <p className="text-museum-700 mt-2">Be the first to preserve a failure.</p>
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
