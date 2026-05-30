'use client';

import type { HTMLAttributes } from 'react';

/**
 * Lamplit Archive — TickMarks.
 *
 * Pain / regret levels are NEVER rendered as numerals or stars. Instead
 * a row of 4 small horizontal slabs: brass when "filled", vellum when not.
 * The numeric scale (0-10) maps onto 0-4 ticks via simple division by 2.5
 * with rounding — anything 1-2 = one tick, 3-4 = two, 5-6 = three, 7-10 = four.
 *
 *     <TickMarks value={6} />  →  ▮▮▮▯
 */
interface TickMarksProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-10 (or any range — clamped & quantised)
  total?: number; // default 4
  label?: string; // accessible label e.g. "Pain 6/10"
}

export function TickMarks({
  value,
  total = 4,
  label,
  className = '',
  ...props
}: TickMarksProps) {
  const clamped = Math.max(0, Math.min(value, 10));
  const filled = Math.round((clamped / 10) * total);

  return (
    <div
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-label={label}
      className={['inline-flex items-center gap-1', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={[
            'block w-3.5 h-[3px]',
            i < filled ? 'bg-brass' : 'bg-vellum',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

/**
 * Lamplit Archive — EngravedDivider.
 *
 * A hairline brass-tinted line. If a `label` is given it's centered as a
 * mono-caps eyebrow on top, with the line passing behind it. Replaces the
 * thick horizontal rules from the previous direction.
 *
 *     <EngravedDivider label="// THIS WALK — TEN EXHIBITS" />
 */
interface EngravedDividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  align?: 'center' | 'left' | 'right';
}

export function EngravedDivider({
  label,
  align = 'center',
  className = '',
  ...props
}: EngravedDividerProps) {
  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  return (
    <div
      role="separator"
      className={['relative w-full flex items-center', alignClass, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div aria-hidden className="absolute inset-0 flex items-center">
        <div className="h-px w-full bg-glass-edge" />
      </div>
      {label && (
        <span className="relative bg-bone px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          {label}
        </span>
      )}
    </div>
  );
}
