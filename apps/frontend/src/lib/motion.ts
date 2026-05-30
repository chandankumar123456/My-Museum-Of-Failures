import type { Transition, Variants } from 'framer-motion';

/**
 * Lamplit Archive — motion presets (Phase 20).
 *
 * The Archive uses ONE spring for every component-level transition.
 * No separate easings, no custom cubic-beziers per page. The spring is
 * weighty (mass 0.9), restrained (stiffness 110, damping 22), and gives
 * a measured, archival feel — never bouncy, never elastic.
 *
 * - List-style entrances cascade with a 60ms `staggerChildren`.
 * - Persistent "breathe" loops on visible artifacts run for 6s, ±0.5%
 *   scale, with a randomised phase per instance to avoid synchrony.
 * - All other animations transform `opacity` + `transform` only.
 */

export const SPRING: Transition = {
  type: 'spring',
  stiffness: 110,
  damping: 22,
  mass: 0.9,
};

export const STAGGER_INTERVAL = 0.06; // 60ms — the canonical cadence.

// ---- Element-level entrances ---------------------------------------------

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: SPRING },
};

export const liftIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING },
};

// ---- List orchestration --------------------------------------------------

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER_INTERVAL,
      delayChildren: 0.1,
    },
  },
};

// ---- Page entrance (kept as motion props for non-variant consumers) ------

export const cinematicEntrance = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: SPRING,
} as const;

export const slowFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: SPRING,
} as const;

// ---- Persistent micro-loop ----------------------------------------------

/**
 * Generate a `breathe` motion loop for an artifact. Pass an index so
 * each artifact's phase offset is deterministic (avoids synchrony when
 * many artifacts are visible at once).
 */
export function breathe(index: number = 0) {
  const delay = (index * 0.37) % 6;
  return {
    animate: { scale: [1, 1.005, 1] },
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      delay,
    },
  };
}
