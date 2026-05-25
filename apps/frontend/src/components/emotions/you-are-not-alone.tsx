'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ExhibitView } from '@museum/shared';
import { api } from '@/lib/api';
import { getCategoryLabel } from '@/lib/utils';

interface YouAreNotAloneProps {
  exhibitId: string;
}

export function YouAreNotAlone({ exhibitId }: YouAreNotAloneProps) {
  const [related, setRelated] = useState<ExhibitView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.exhibits
      .similar(exhibitId)
      .then((data) => setRelated(Array.isArray(data) ? (data as ExhibitView[]) : []))
      .catch(() => setRelated([]))
      .finally(() => setLoading(false));
  }, [exhibitId]);

  if (loading || related.length === 0) return null;

  return (
    <div className="museum-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🤝</span>
        <h3 className="font-serif text-lg text-whisper">You Are Not Alone</h3>
      </div>
      <p className="text-sm text-whisper-dark mb-4">Others have experienced something similar:</p>
      <div className="space-y-2">
        {related.slice(0, 5).map((exhibit, i) => (
          <motion.div
            key={exhibit.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/exhibits/${exhibit.id}`}
              className="block p-3 rounded-sm border border-museum-800 hover:border-ember/30 transition-colors"
            >
              <div className="text-sm text-whisper font-medium truncate">{exhibit.title}</div>
              <div className="flex items-center gap-2 text-xs text-museum-600 mt-1">
                <span>{getCategoryLabel(exhibit.category)}</span>
                <span>·</span>
                <span
                  className={
                    exhibit.recoveryStatus === 'recovered'
                      ? 'text-emerald-400'
                      : 'text-whisper-dark'
                  }
                >
                  {exhibit.endingStatus?.replace(/_/g, ' ')}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
