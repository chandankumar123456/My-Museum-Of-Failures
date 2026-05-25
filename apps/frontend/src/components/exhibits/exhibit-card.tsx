'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ExhibitView } from '@museum/shared';
import { getCategoryLabel, getEndingStatusColor, getExhibitIdDisplay, formatDate } from '@/lib/utils';

interface ExhibitCardProps {
  exhibit: ExhibitView;
  index?: number;
}

export function ExhibitCard({ exhibit, index = 0 }: ExhibitCardProps) {
  const decayStyles = [
    '',
    'opacity-90',
    'opacity-80',
    'opacity-70 blur-[0.3px]',
    'opacity-60 blur-[0.5px]',
    'opacity-50 blur-[0.8px]',
  ];

  const decayLevel = Math.min(exhibit.decayLevel ?? 0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
    >
      <Link href={`/exhibits/${exhibit.id}`}>
        <div
          className={`group relative museum-card p-5 hover:border-ember/30 transition-all duration-500 cursor-pointer ${decayStyles[decayLevel]}`}
        >
          {decayLevel > 0 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void/20"
                style={{ opacity: decayLevel * 0.1 }}
              />
            </div>
          )}

          <div className="flex items-start justify-between mb-3">
            <span className="font-mono text-xs text-whisper-dark">
              {getExhibitIdDisplay(exhibit.exhibitId)}
            </span>
            {exhibit.stillHurts && (
              <span className="text-xs text-red-400/60" title="Still hurts">
                still hurts
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl text-whisper mb-2 group-hover:text-ember transition-colors duration-300">
            {exhibit.title}
          </h3>

          <p className="text-sm text-whisper-dark line-clamp-2 mb-4 font-light">
            {exhibit.story || exhibit.lessonLearned || 'A preserved memory.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-2 py-1 bg-void border border-museum-800 rounded-sm text-whisper-dark">
              {getCategoryLabel(exhibit.category)}
            </span>

            <span className={getEndingStatusColor(exhibit.endingStatus)}>
              {exhibit.endingStatus?.replace(/_/g, ' ')}
            </span>

            <span className="text-museum-600">Pain {exhibit.painLevel}/10</span>

            <span className="text-museum-600 ml-auto">{formatDate(exhibit.createdAt)}</span>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-museum-700">
            {exhibit.reactions && <span>{exhibit.reactions.length} reactions</span>}
            {exhibit.room && <span>{exhibit.room.name}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
