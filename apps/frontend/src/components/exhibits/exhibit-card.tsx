'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ExhibitView } from '@museum/shared';
import { getCategoryLabel, getEndingStatusColor, getExhibitIdDisplay, formatDate } from '@/lib/utils';

interface ExhibitCardProps {
  exhibit: ExhibitView;
  index?: number;
  className?: string;
}

export function ExhibitCard({ exhibit, index = 0, className = '' }: ExhibitCardProps) {
  const decayStyles = [
    '',
    'opacity-90',
    'opacity-85',
    'opacity-70 blur-[0.3px]',
    'opacity-60 blur-[0.4px]',
    'opacity-55 blur-[0.5px]',
  ];

  const decayLevel = Math.min(exhibit.decayLevel ?? 0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className={className}
    >
      <Link href={`/exhibits/${exhibit.id}`} className="block h-full">
        <div
          className={`group relative bg-shadow-surface border-t border-museum-border border-x-0 border-b-0 p-8 rounded-md hover:border-t-ember hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer h-full flex flex-col justify-between ${decayStyles[decayLevel]}`}
        >
          {decayLevel > 0 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void-black/25"
                style={{ opacity: decayLevel * 0.1 }}
              />
            </div>
          )}

          <div>
            <div className="flex items-start justify-between mb-6">
              <span className="font-mono text-xs text-whisper-dark">
                {getExhibitIdDisplay(exhibit.exhibitId)}
              </span>
              {exhibit.stillHurts && (
                <span className="text-xs text-decay-red/60 font-mono tracking-wider" title="Still hurts">
                  still hurts
                </span>
              )}
            </div>

            <h3 className="font-serif text-2xl text-on-surface mb-4 group-hover:text-ember transition-colors duration-300 leading-snug">
              {exhibit.title}
            </h3>

            <p className="font-sans text-body-md text-whisper-dark line-clamp-3 mb-8 leading-relaxed font-light">
              {exhibit.story || exhibit.lessonLearned || 'A preserved memory.'}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs pt-4 border-t border-museum-border/40">
              <span className="px-2.5 py-1 bg-void-black border border-museum-border rounded-sm text-whisper-dark font-mono text-[10px]">
                {getCategoryLabel(exhibit.category)}
              </span>

              <span className={`px-2 py-0.5 rounded-sm font-mono text-[10px] uppercase tracking-wider ${getEndingStatusColor(exhibit.endingStatus)}`}>
                {exhibit.endingStatus?.replace(/_/g, ' ')}
              </span>

              <span className="text-whisper-dark/60 font-mono text-[11px]">Pain {exhibit.painLevel}/10</span>

              <span className="text-whisper-dark/60 ml-auto font-mono text-[11px]">{formatDate(exhibit.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
