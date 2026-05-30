'use client';

import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion';
import Link from 'next/link';
import type { ExhibitView } from '@museum/shared';
import { EmotionalReaction } from '@museum/shared';
import { fadeUp } from '@/lib/motion';
import { getCategoryLabel, getExhibitIdDisplay, formatDate } from '@/lib/utils';
import { Artifact, Plaque } from './plaque';
import { TickMarks } from './tick-marks';
import { ReactionGlyph, REACTION_LABELS } from './reaction-glyph';

/**
 * Lamplit Archive — ExhibitCard.
 *
 * THE signature Plaque-+-Artifact card. Used everywhere an exhibit appears
 * in a list (archive grid, room detail, random walk, last attempts,
 * "you are not alone" rail).
 *
 * Layout: 40% artifact well on the left, 60% plaque on the right. On
 * mobile the two stack into a single column. Hover lifts the card -2px
 * with the canonical spring (no shadow inflation).
 *
 * Typography: Fraunces serif for the headline. Geist for the body excerpt.
 * JetBrains Mono for the category caps + exhibit ID.
 *
 * Reactions: 3 glyphs are shown as a passive summary. The full 6-glyph
 * reaction strip lives on the detail page.
 */

const PRIMARY_REACTIONS: EmotionalReaction[] = [
  EmotionalReaction.I_UNDERSTAND,
  EmotionalReaction.THIS_HURT,
  EmotionalReaction.I_RELATE,
];

interface ExhibitCardProps {
  exhibit: ExhibitView;
  index?: number;
  className?: string;
  /** When true, removes the breathe loop (used for dense lists like /constellation). */
  staticArtifact?: boolean;
}

export function ExhibitCard({
  exhibit,
  index = 0,
  className = '',
  staticArtifact = false,
}: ExhibitCardProps) {
  const excerpt =
    exhibit.story?.trim() ||
    exhibit.lessonLearned?.trim() ||
    'A preservation in the archive.';

  const truncated = excerpt.length > 180 ? `${excerpt.slice(0, 177).trimEnd()}…` : excerpt;

  // Subtle scroll-velocity skew — the card leans into fast scrolling, then
  // settles via spring. Clamped to ±2deg; neutralised under reduced motion.
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const skew = useSpring(useVelocity(scrollY), { stiffness: 200, damping: 50 });
  const skewY = useTransform(skew, [-2000, 0, 2000], [2, 0, -2], { clamp: true });

  // Derive the artifact image from the first attached image-type artifact,
  // if any. Otherwise the well stays empty (the breathe loop still plays
  // on the recessed surface).
  const thumbnailUrl =
    exhibit.artifacts?.find(
      (a) => (a.type === 'image' || a.type === 'screenshot') && !a.decayed,
    )?.url;

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -2 }}
      style={{ skewY: reduce ? 0 : skewY }}
      className={[
        'group block rounded-lg overflow-hidden',
        'bg-paper border border-glass-edge hover:border-brass/30',
        'transition-colors duration-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Link
        href={`/exhibits/${exhibit.id}`}
        className="flex flex-col md:flex-row no-underline focus:outline-none"
      >
        <div className="w-full md:w-2/5 shrink-0">
          <Artifact
            index={staticArtifact ? -1 : index}
            imageUrl={thumbnailUrl}
            imageAlt={`Artifact for ${exhibit.title}`}
          />
        </div>

        <Plaque className="border-l-0 md:border-l border-t md:border-t-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                {getCategoryLabel(exhibit.category)}
              </span>
              <span className="font-mono text-[10px] tracking-tight text-whisper">
                {getExhibitIdDisplay(exhibit.exhibitId)}
              </span>
            </div>

            <TickMarks
              value={exhibit.painLevel ?? 0}
              label={`Pain ${exhibit.painLevel ?? 0}/10`}
            />

            <h3 className="font-display text-[clamp(1.25rem,1.4vw,1.5rem)] leading-[1.25] text-ink group-hover:text-brass transition-colors duration-300">
              {exhibit.title}
            </h3>

            <p className="font-sans text-[14px] leading-relaxed text-ink-muted line-clamp-3">
              {truncated}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-glass-edge">
            <div className="flex items-center gap-3">
              {PRIMARY_REACTIONS.map((reaction) => (
                <ReactionGlyph
                  key={reaction}
                  reaction={reaction}
                  aria-label={REACTION_LABELS[reaction]}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] tracking-tight text-whisper">
              {formatDate(exhibit.createdAt)}
            </span>
          </div>
        </Plaque>
      </Link>
    </motion.article>
  );
}
