/**
 * Lamplit Archive — 3D barrel.
 *
 * The 3-layer 3D system:
 *   Layer 1 — Ambient shader (one fullscreen plane, room-tinted).
 *   Layer 2 — Functional artifacts (per-card 3D objects).
 *   Layer 3 — Page-level set pieces (one signature scene per page).
 *
 *   import {
 *     Lamplit3D, useRoomTint, ROOM_TINTS,
 *     SetPiece, Artifact3D, LandingHeroSetPiece,
 *   } from '@/components/lamplit-3d';
 */

export { Lamplit3D } from './lamplit-3d';
export { RoomTintProvider, useRoomTint, ROOM_TINTS } from './room-context';
export type { RoomTintName } from './room-context';

export { SetPiece, useSetPiece } from './set-piece-context';

export {
  Artifact3D,
  BrokenInstrument,
  SealedLetter,
  FadingPhotograph,
  SeveredThread,
  LockedBox,
  DustVeiledFrame,
} from './artifacts';

export { LandingHeroSetPiece } from './set-pieces/landing-hero';
