'use client';

import { ExhibitionCategory } from '@museum/shared';
import {
  BrokenInstrument,
  SealedLetter,
  FadingPhotograph,
  SeveredThread,
  LockedBox,
  DustVeiledFrame,
} from './families';
import type { ComponentType } from 'react';

/**
 * Lamplit Archive — category → family dispatcher.
 *
 * Maps each of the 15 `ExhibitionCategory` enum values onto one of six
 * artifact families. Use `<Artifact3D category={...} />` to render the
 * matching family inside any 3D context (typically a portal into the
 * shared canvas).
 */

const CATEGORY_FAMILY: Record<ExhibitionCategory, ComponentType> = {
  // Career & ambition
  [ExhibitionCategory.STARTUP_FAILURE]: LockedBox,
  [ExhibitionCategory.CAREER_REGRET]: DustVeiledFrame,
  [ExhibitionCategory.INTERVIEW_REJECTION]: SeveredThread,
  [ExhibitionCategory.FAILED_SIDE_PROJECT]: BrokenInstrument,

  // Education & finance
  [ExhibitionCategory.ACADEMIC_COLLAPSE]: LockedBox,
  [ExhibitionCategory.FINANCIAL_MISTAKE]: LockedBox,

  // Identity & dream
  [ExhibitionCategory.IDENTITY_CRISIS]: FadingPhotograph,
  [ExhibitionCategory.MISSED_OPPORTUNITY]: FadingPhotograph,
  [ExhibitionCategory.UNREALIZED_DREAM]: FadingPhotograph,

  // Health & exhaustion
  [ExhibitionCategory.BURNOUT]: SeveredThread,
  [ExhibitionCategory.MENTAL_EXHAUSTION]: SeveredThread,

  // Relationships
  [ExhibitionCategory.RELATIONSHIP_FAILURE]: SealedLetter,
  [ExhibitionCategory.FAMILY_CONFLICT]: SealedLetter,
  [ExhibitionCategory.BETRAYAL]: DustVeiledFrame,

  // Creative
  [ExhibitionCategory.CREATIVE_FAILURE]: BrokenInstrument,
};

interface Artifact3DProps {
  category: ExhibitionCategory;
}

export function Artifact3D({ category }: Artifact3DProps) {
  const Family = CATEGORY_FAMILY[category] ?? DustVeiledFrame;
  return <Family />;
}

export {
  BrokenInstrument,
  SealedLetter,
  FadingPhotograph,
  SeveredThread,
  LockedBox,
  DustVeiledFrame,
};
