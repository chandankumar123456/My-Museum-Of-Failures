'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import type { ExhibitView, ExhibitListView } from '@museum/shared';

const RADIUS_OUTER = 240;
const RADIUS_INNER = 80;

export default function ConstellationPage() {
  const [exhibits, setExhibits] = useState<ExhibitView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.exhibits
      .list('limit=80')
      .then((data) => {
        const list = (data as ExhibitListView).exhibits ?? [];
        setExhibits(list);
      })
      .catch(() => setExhibits([]))
      .finally(() => setLoading(false));
  }, []);

  const nodes = useMemo(() => {
    const groups = new Map<string, ExhibitView[]>();
    for (const exhibit of exhibits) {
      const arr = groups.get(exhibit.category) ?? [];
      arr.push(exhibit);
      groups.set(exhibit.category, arr);
    }

    const groupKeys = Array.from(groups.keys());
    const positioned: Array<{
      exhibit: ExhibitView;
      x: number;
      y: number;
      groupAngle: number;
    }> = [];

    groupKeys.forEach((key, gi) => {
      const groupAngle = (gi / Math.max(groupKeys.length, 1)) * Math.PI * 2;
      const groupExhibits = groups.get(key) ?? [];

      groupExhibits.forEach((exhibit, ei) => {
        const localOffset = (ei - groupExhibits.length / 2) * 0.12;
        const angle = groupAngle + localOffset;
        const radius =
          RADIUS_INNER + ((exhibit.painLevel || 5) / 10) * (RADIUS_OUTER - RADIUS_INNER);
        positioned.push({
          exhibit,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          groupAngle,
        });
      });
    });

    return positioned;
  }, [exhibits]);

  return (
    <MuseumLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
          <span className="text-4xl block mb-2">🌌</span>
          <h1 className="font-serif text-4xl text-whisper-light mb-2">Failure Constellation</h1>
          <p className="text-whisper-dark font-light max-w-xl mx-auto">
            Each star is a preserved exhibit. Distance from the center reflects pain. Clusters
            map to categories.
          </p>
        </motion.div>

        <div className="museum-card p-4 md:p-8 overflow-hidden">
          {loading ? (
            <div className="h-[520px] flex items-center justify-center text-museum-600">
              Listening to the dark…
            </div>
          ) : exhibits.length === 0 ? (
            <div className="h-[520px] flex flex-col items-center justify-center text-center">
              <p className="font-serif text-xl text-museum-600">The sky is empty.</p>
              <p className="text-museum-700 text-sm mt-2">
                Be the first to add a star to this universe.
              </p>
            </div>
          ) : (
            <svg
              viewBox="-300 -300 600 600"
              className="w-full h-[520px]"
              role="img"
              aria-label="Failure constellation map"
            >
              <defs>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d4592b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#d4592b" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="0" cy="0" r="60" fill="url(#centerGlow)" />
              <circle cx="0" cy="0" r="3" fill="#d4592b" />

              {nodes.map(({ exhibit, x, y }) => (
                <line
                  key={`line-${exhibit.id}`}
                  x1={0}
                  y1={0}
                  x2={x}
                  y2={y}
                  stroke="#52473c"
                  strokeOpacity={0.15}
                  strokeWidth={0.5}
                />
              ))}

              {nodes.map(({ exhibit, x, y }, i) => (
                <Link key={exhibit.id} href={`/exhibits/${exhibit.id}`}>
                  <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01, duration: 0.4 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={3 + (exhibit.painLevel || 5) * 0.25}
                      fill="#c4bcb0"
                      fillOpacity={0.7}
                    >
                      <title>{exhibit.title}</title>
                    </circle>
                  </motion.g>
                </Link>
              ))}
            </svg>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-museum-600">
          {CATEGORIES.slice(0, 8).map((c) => (
            <span key={c.value} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-whisper-dark/60" />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </MuseumLayout>
  );
}
