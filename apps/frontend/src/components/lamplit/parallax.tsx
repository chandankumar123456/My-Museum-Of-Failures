'use client';

import { useRef, type ReactNode } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/**
 * Lamplit Archive — Parallax primitive.
 *
 * Drifts its children vertically as the element travels through the
 * viewport, creating restrained editorial depth (archival, not theme-park).
 * Pairs with the site-wide Lenis smooth-scroll for a fluid feel.
 *
 * `offset` is the peak vertical drift in pixels, applied ± across the
 * element's scroll progress. Renders children untransformed under
 * `prefers-reduced-motion`.
 */
export function Parallax({
  children,
  offset = 40,
  className,
}: {
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
