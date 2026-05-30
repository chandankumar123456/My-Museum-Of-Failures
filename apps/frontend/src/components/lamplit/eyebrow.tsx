'use client';

import type { HTMLAttributes } from 'react';

/**
 * Lamplit Archive — Eyebrow.
 *
 * The little mono-caps line that sits above every section headline.
 * Optionally prefixed by the canonical `// ` and visually marked by a
 * 1px × 8px brass tick on the left.
 *
 *     <Eyebrow tick>Archive No. 001</Eyebrow>
 *     // ARCHIVE NO. 001  →  rendered with brass tick
 *
 * @param tick   show the brass tick prefix (default: true)
 * @param prefix prepend a custom mono prefix (default: '// ')
 */
interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  tick?: boolean;
  prefix?: string;
}

export function Eyebrow({
  children,
  tick = true,
  prefix = '// ',
  className = '',
  ...props
}: EyebrowProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-2',
        'font-mono text-[11px] uppercase tracking-[0.16em] text-whisper',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {tick && <span className="brass-tick" aria-hidden />}
      <span>
        {prefix}
        {children}
      </span>
    </span>
  );
}

/**
 * Lamplit Archive — Tag.
 *
 * Engraved-glyph style: mono uppercase, slight letter-spacing, optional
 * brass underline on hover when interactive. 4px radius. Never a pill.
 *
 * @param tone        'default' (whisper) or 'brass' (active / selected)
 * @param interactive use as a clickable filter toggle (adds hover)
 */
interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'brass' | 'muted';
  interactive?: boolean;
}

export function Tag({
  children,
  tone = 'default',
  interactive = false,
  className = '',
  ...props
}: TagProps) {
  const toneClass =
    tone === 'brass'
      ? 'text-brass border-brass/60 bg-brass-soft'
      : tone === 'muted'
        ? 'text-whisper border-glass-edge'
        : 'text-ink-muted border-glass-edge';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'font-mono text-[10px] uppercase tracking-[0.12em]',
        'px-2 py-1 rounded-sm border',
        toneClass,
        interactive ? 'cursor-pointer transition-colors hover:text-brass hover:border-brass/60' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
