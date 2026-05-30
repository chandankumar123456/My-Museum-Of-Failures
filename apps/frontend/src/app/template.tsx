'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * App Router template — re-mounts on every navigation, so this is where the
 * site's route transition lives. A short opacity crossfade (no transform, so
 * sticky/fixed chrome is untouched) turns the hard cut between pages into a
 * smooth dissolve. Disabled entirely under prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
