'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ExhibitView } from '@museum/shared';
import { api } from '@/lib/api';
import { getCategoryLabel, getExhibitIdDisplay } from '@/lib/utils';
import { Eyebrow, TickMarks } from '@/components/lamplit';
import { fadeUp, stagger } from '@/lib/motion';

/**
 * Lamplit Archive — "You Are Not Alone" rail.
 *
 * Up to 3 related preservations stacked vertically, rendered as compact
 * Plaque cards (no Artifact column). Each entry mirrors the metadata
 * grammar of the main `<ExhibitCard>` so the visitor reads them the
 * same way.
 */

interface Props {
  exhibitId: string;
}

export function YouAreNotAlone({ exhibitId }: Props) {
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
    <section className="pt-2 space-y-4">
      <Eyebrow>You are not alone</Eyebrow>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {related.slice(0, 3).map((exhibit) => (
          <motion.div key={exhibit.id} variants={fadeUp}>
            <Link
              href={`/exhibits/${exhibit.id}`}
              className="group block bg-paper border border-glass-edge rounded-md p-5 transition-colors hover:border-brass/40"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                  {getCategoryLabel(exhibit.category)}
                </span>
                <span className="font-mono text-[10px] tracking-tight text-whisper">
                  {getExhibitIdDisplay(exhibit.exhibitId)}
                </span>
              </div>

              <h4 className="font-display text-[1.0625rem] leading-snug text-ink group-hover:text-brass transition-colors">
                {exhibit.title}
              </h4>

              <p className="mt-2 font-sans text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                {exhibit.story || exhibit.lessonLearned || 'A preservation in the archive.'}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <TickMarks
                  value={exhibit.painLevel ?? 0}
                  label={`Pain ${exhibit.painLevel ?? 0}/10`}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-whisper">
                  Pain
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
