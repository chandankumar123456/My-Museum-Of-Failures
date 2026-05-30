'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp } from '@/lib/motion';

/**
 * Lamplit Archive — EmptyComposed.
 *
 * Empty states are NEVER "No data found." They are tiny composed scenes:
 * a small SVG illustration (a pressed flower, a sealed envelope, an
 * empty plinth) and a poetic caption.
 *
 *     <EmptyComposed
 *       title="The archive is quiet."
 *       caption="Nothing here yet — and that is also a kind of preservation."
 *       illustration={<PressedFlower />}
 *     />
 */
interface EmptyComposedProps {
  title: string;
  caption?: string;
  illustration?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyComposed({
  title,
  caption,
  illustration,
  action,
  className = '',
}: EmptyComposedProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className={[
        'flex flex-col items-center text-center',
        'py-16 px-6',
        'max-w-[42ch] mx-auto',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {illustration ? (
        <div className="text-whisper mb-8 [&_svg]:w-16 [&_svg]:h-16">{illustration}</div>
      ) : (
        <DefaultIllustration />
      )}

      <p className="font-display italic text-[clamp(1.25rem,1.4vw,1.5rem)] leading-snug text-ink mb-3">
        {title}
      </p>

      {caption && (
        <p className="font-sans text-[14px] leading-relaxed text-ink-muted">{caption}</p>
      )}

      {action && <div className="mt-8">{action}</div>}
    </motion.div>
  );
}

/**
 * The default illustration — a small pressed flower in line work.
 * Used when the consumer doesn't pass their own.
 */
function DefaultIllustration() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      className="text-whisper mb-8"
      aria-hidden
    >
      <path d="M32 12c4 6 4 12 0 18-4-6-4-12 0-18Z" />
      <path d="M16 28c8 0 13 3 16 8-8 0-13-3-16-8Z" />
      <path d="M48 28c-8 0-13 3-16 8 8 0 13-3 16-8Z" />
      <path d="M32 36v18" />
      <circle cx="32" cy="22" r="2.2" />
    </svg>
  );
}
