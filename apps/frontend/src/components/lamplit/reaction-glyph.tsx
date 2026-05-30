'use client';

import { EmotionalReaction } from '@museum/shared';
import type { ReactElement, SVGProps } from 'react';

/**
 * Lamplit Archive — ReactionGlyph.
 *
 * Reactions are NEVER emoji. They are small (16-18px, 1.25 stroke) line
 * icons styled like engravings. Hover lifts the stroke from whisper → brass;
 * the `active` prop draws the glyph in brass to indicate the visitor has
 * already left this reaction.
 *
 * The 6 canonical reactions from `@museum/shared` map to:
 *
 *   i_relate            → mirrored ditto strokes ("same as mine")
 *   i_survived_this_too → small rising sun (recovery)
 *   still_recovering    → small candle flame (continuing warmth)
 *   this_hurt           → broken heart
 *   you_were_brave      → open raised palm
 *   i_understand        → open eye (witnessed)
 */

interface ReactionGlyphProps extends SVGProps<SVGSVGElement> {
  reaction: EmotionalReaction;
  active?: boolean;
  size?: number;
}

const PATHS: Record<EmotionalReaction, ReactElement> = {
  [EmotionalReaction.I_RELATE]: (
    <>
      <path d="M7 8v8" />
      <path d="M10 8v8" />
      <path d="M14 8v8" />
      <path d="M17 8v8" />
    </>
  ),
  [EmotionalReaction.I_SURVIVED_THIS_TOO]: (
    <>
      <path d="M3 18h18" />
      <path d="M6 18a6 6 0 0 1 12 0" />
      <path d="M12 5v3" />
      <path d="M5.5 8l2 2" />
      <path d="M18.5 8l-2 2" />
    </>
  ),
  [EmotionalReaction.STILL_RECOVERING]: (
    <>
      <path d="M12 4c-1.5 2.5-3 4-3 6.5a3 3 0 1 0 6 0c0-2.5-1.5-4-3-6.5Z" />
      <path d="M12 14v6" />
      <path d="M9 20h6" />
    </>
  ),
  [EmotionalReaction.THIS_HURT]: (
    <>
      <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 6.5-7 11-7 11Z" />
      <path d="M12 8.5l-1.5 3 3 1.5-2 3" />
    </>
  ),
  [EmotionalReaction.YOU_WERE_BRAVE]: (
    <>
      <path d="M9 11V5a1.5 1.5 0 1 1 3 0v6" />
      <path d="M12 11V4a1.5 1.5 0 1 1 3 0v7" />
      <path d="M15 11V6a1.5 1.5 0 1 1 3 0v7" />
      <path d="M6 13a3 3 0 0 1 3-3v6a4 4 0 0 0 4 4h2a5 5 0 0 0 5-5v-2" />
    </>
  ),
  [EmotionalReaction.I_UNDERSTAND]: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

export function ReactionGlyph({
  reaction,
  active = false,
  size = 18,
  className = '',
  ...props
}: ReactionGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        'transition-colors duration-200',
        active ? 'text-brass' : 'text-whisper hover:text-brass',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
      {...props}
    >
      {PATHS[reaction]}
    </svg>
  );
}

/**
 * Display label for a reaction (used as visible button text + aria-label).
 * Keeps copy in one place so screens don't drift.
 */
export const REACTION_LABELS: Record<EmotionalReaction, string> = {
  [EmotionalReaction.I_RELATE]: 'I relate',
  [EmotionalReaction.I_SURVIVED_THIS_TOO]: 'I survived this too',
  [EmotionalReaction.STILL_RECOVERING]: 'Still recovering',
  [EmotionalReaction.THIS_HURT]: 'This hurt',
  [EmotionalReaction.YOU_WERE_BRAVE]: 'You were brave',
  [EmotionalReaction.I_UNDERSTAND]: 'I understand',
};
