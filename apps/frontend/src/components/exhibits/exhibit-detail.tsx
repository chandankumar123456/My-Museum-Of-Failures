'use client';

import { motion } from 'framer-motion';
import type { ExhibitView } from '@museum/shared';
import { formatDate, getExhibitIdDisplay, getCategoryLabel, getEndingStatusColor } from '@/lib/utils';

export function ExhibitDetail({ exhibit }: { exhibit: ExhibitView | null | undefined }) {
  if (!exhibit) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-sm text-whisper-dark">
              {getExhibitIdDisplay(exhibit.exhibitId)}
            </span>
            <span className="text-xs px-2 py-1 bg-void border border-museum-800 rounded-sm text-whisper-dark">
              {getCategoryLabel(exhibit.category)}
            </span>
            {exhibit.room && (
              <span className="text-xs text-museum-600">
                {exhibit.room.name}
              </span>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-whisper-light mb-4">
            {exhibit.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-museum-600">
            <span>{formatDate(exhibit.createdAt)}</span>
            <span>{exhibit.viewCount || 0} views</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="museum-card p-6"
          >
            <h3 className="font-serif text-lg text-whisper mb-3">What I Thought Would Happen</h3>
            <p className="text-whisper-dark font-light leading-relaxed">
              {exhibit.expectedOutcome}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="museum-card p-6 border-ember/20"
          >
            <h3 className="font-serif text-lg text-ember mb-3">What Actually Happened</h3>
            <p className="text-whisper-dark font-light leading-relaxed">
              {exhibit.actualOutcome}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="font-serif text-2xl text-whisper mb-4">The Story</h2>
          <div className="museum-card p-6">
            <p className="text-whisper-dark font-light leading-relaxed whitespace-pre-wrap">
              {exhibit.story}
            </p>
          </div>
        </motion.div>

        {exhibit.lessonLearned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-serif text-2xl text-emerald-400 mb-4">What I Learned</h2>
            <div className="museum-card p-6 border-emerald-900/30">
              <p className="text-whisper-dark font-light leading-relaxed whitespace-pre-wrap">
                {exhibit.lessonLearned}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="museum-card p-4 text-center">
            <div className="text-2xl text-ember mb-1">{exhibit.painLevel}/10</div>
            <div className="text-xs text-museum-600 uppercase tracking-wider">Pain Level</div>
          </div>
          <div className="museum-card p-4 text-center">
            <div className="text-2xl text-amber-400 mb-1">{exhibit.regretLevel}/10</div>
            <div className="text-xs text-museum-600 uppercase tracking-wider">Regret Level</div>
          </div>
          <div className="museum-card p-4 text-center">
            <div className="text-2xl text-blue-400 mb-1">{exhibit.recoveryProgress}%</div>
            <div className="text-xs text-museum-600 uppercase tracking-wider">Recovery</div>
          </div>
          <div className="museum-card p-4 text-center">
            <div className={`text-lg mb-1 capitalize ${getEndingStatusColor(exhibit.endingStatus)}`}>
              {exhibit.endingStatus?.replace(/_/g, ' ')}
            </div>
            <div className="text-xs text-museum-600 uppercase tracking-wider">Ending Status</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {exhibit.emotionalTags?.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-void-light border border-museum-800 rounded-full text-xs text-whisper-dark"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex items-center gap-6 text-sm text-museum-600"
        >
          {exhibit.stillHurts && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              Still hurts
            </span>
          )}
          {exhibit.wouldRetry && (
            <span>Would retry · Retries: {exhibit.retryCount || 0}</span>
          )}
          <span>Recovery: {exhibit.recoveryStatus?.replace(/_/g, ' ')}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
