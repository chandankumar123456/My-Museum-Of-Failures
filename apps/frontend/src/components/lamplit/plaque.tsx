'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { breathe } from '@/lib/motion';

/**
 * Lamplit Archive — Artifact.
 *
 * The left ~40% of an exhibit card. Renders an "artifact well" — a
 * vellum-tinted recess with an inset shadow — and applies the persistent
 * breathe micro-loop (±0.5% scale, 6s, randomised phase).
 *
 * Use the children API for SVG illustrations or 3D fallbacks. Use
 * `imageUrl` for editorial photographs (museum-quality still lifes).
 */
interface ArtifactProps {
  imageUrl?: string;
  imageAlt?: string;
  index?: number;
  className?: string;
  children?: ReactNode;
}

export function Artifact({
  imageUrl,
  imageAlt,
  index = 0,
  className = '',
  children,
}: ArtifactProps) {
  const loop = breathe(index);

  return (
    <motion.div
      {...loop}
      className={[
        'artifact-well rounded-md',
        'flex items-center justify-center',
        'overflow-hidden relative',
        'aspect-[4/3] w-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Vitrine focus — the artifact eases toward the glass as the plaque
          is examined (group-hover on the parent card). */}
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? ''}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover mix-blend-multiply opacity-90"
          />
        ) : (
          children
        )}
      </div>

      {/* Lamp glow — a warm brass light rakes down across the artifact when
          examined. Pure atmosphere; fades in on hover, never on by default. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(130% 90% at 50% -15%, rgba(168,121,75,0.20), transparent 68%)',
        }}
      />
    </motion.div>
  );
}

/**
 * Lamplit Archive — Plaque.
 *
 * The right ~60% of an exhibit card. Holds curatorial metadata: a category
 * tag, mono exhibit ID, pain ticks, headline, body excerpt, reaction glyphs.
 *
 * This component does not enforce its own content layout — consumers compose
 * children inside it. It's just a paper-tinted padded surface that pairs
 * visually with `<Artifact />`.
 */
interface PlaqueProps {
  className?: string;
  children: ReactNode;
}

export function Plaque({ className = '', children }: PlaqueProps) {
  return (
    <div
      className={[
        'flex-1 min-w-0',
        'flex flex-col justify-between gap-4',
        'p-6 md:p-8',
        'bg-paper',
        'border-l border-glass-edge',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
