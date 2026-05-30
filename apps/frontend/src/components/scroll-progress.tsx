'use client';

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Lamplit Archive — reading-progress hairline.
 *
 * A 2px brass line pinned to the top edge that tracks scroll depth — a quiet
 * "how far through the archive" cue that complements the site-wide smooth
 * scroll. Spring values match the canonical spring in `lib/motion.ts`
 * (stiffness 110, damping 22, mass 0.9). Hidden entirely under reduced motion.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 22,
    mass: 0.9,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-brass"
      style={{ scaleX }}
    />
  );
}
