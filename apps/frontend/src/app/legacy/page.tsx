'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { ExhibitCard } from '@/components/exhibits/exhibit-card';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import type { ExhibitView, ExhibitListView } from '@museum/shared';

export default function LegacyPage() {
  const { userId } = useAuthStore();
  const [legacy, setLegacy] = useState<ExhibitView | null>(null);
  const [exhibits, setExhibits] = useState<ExhibitView[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinning, setPinning] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
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
    <MuseumLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10 text-center">
          <span className="text-4xl block mb-2">🏛️</span>
          <h1 className="font-serif text-4xl text-whisper-light mb-2">Legacy Vault</h1>
          <p className="text-whisper-dark font-light">
            Choose one failure to preserve forever. The rest of the museum may decay; the legacy
            never will.
          </p>
        </motion.div>

        {!userId ? (
          <div className="museum-card p-8 text-center">
            <p className="text-museum-600 font-serif text-lg">Connecting to the museum…</p>
            <p className="text-museum-700 text-sm mt-2">
              Your visitor session is still being created.
            </p>
          </div>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-xs uppercase tracking-[0.3em] text-museum-600 mb-3">
                Current Legacy
              </h2>
              {legacy ? (
                <Link
                  href={`/exhibits/${legacy.id}`}
                  className="block museum-card p-6 border-ember/30 museum-glow hover:border-ember transition-colors"
                >
                  <h3 className="font-serif text-2xl text-whisper-light">{legacy.title}</h3>
                  <p className="text-sm text-whisper-dark mt-1 capitalize">
                    {legacy.endingStatus?.replace(/_/g, ' ')}
                  </p>
                </Link>
              ) : (
                <div className="museum-card p-6 border-museum-800 text-museum-600 italic font-serif">
                  No legacy chosen yet. Pin one of your exhibits below.
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xs uppercase tracking-[0.3em] text-museum-600 mb-3">
                Pin a Legacy
              </h2>
              {loading ? (
                <p className="text-museum-700">Loading exhibits…</p>
              ) : exhibits.length === 0 ? (
                <p className="text-museum-700">No exhibits to pin yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exhibits.map((exhibit, i) => (
                    <div key={exhibit.id} className="relative">
                      <ExhibitCard exhibit={exhibit} index={i} />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          pinAsLegacy(exhibit.id);
                        }}
                        disabled={pinning === exhibit.id || legacy?.id === exhibit.id}
                        className="absolute top-3 right-3 text-[10px] uppercase tracking-wider px-2 py-1 border border-museum-800 rounded-sm bg-void/80 text-whisper-dark hover:border-ember/50 hover:text-ember transition-colors disabled:opacity-30"
                      >
                        {legacy?.id === exhibit.id
                          ? 'Pinned'
                          : pinning === exhibit.id
                            ? 'Pinning…'
                            : 'Pin'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MuseumLayout>
  );
}
