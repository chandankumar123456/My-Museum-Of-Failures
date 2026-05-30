'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Lamplit Archive — room tint context.
 *
 * Layer 1 of the 3-layer 3D system needs a single CPU-side source of truth
 * for the currently-active per-room tint. Pages call `setRoomTint(hex)`
 * (typically inside a `useEffect` that fires on mount) and the ambient
 * shader picks up the new colour as a uniform.
 *
 * Defaults to brass — the global accent — when no room is active.
 */

export const ROOM_TINTS = {
  // Sole accent (no room).
  brass: '#A8794B',
  // Per-room (matches `globals.css` --color-* tokens).
  ash: '#7A736A',     // Lost Dreams
  sage: '#7A8B6F',    // Quiet Recovery
  dusk: '#5B6B82',    // Melancholy
  rust: '#9C5544',    // Anger
  bruise: '#6B5470',  // Heartbreak
  pearl: '#B8B0A0',   // Reflection (Random Walk)
  clay: '#A07458',    // Creative Collapse
  amber: '#B98A4D',   // Last Attempts
} as const;

export type RoomTintName = keyof typeof ROOM_TINTS;

interface RoomTintValue {
  /** Current tint as a hex string (e.g. "#A8794B"). */
  tint: string;
  /** Set the tint by hex or named room. Pass `null` to reset to brass. */
  setRoomTint: (input: string | RoomTintName | null) => void;
}

const RoomTintContext = createContext<RoomTintValue | null>(null);

export function RoomTintProvider({ children }: { children: ReactNode }) {
  const [tint, setTint] = useState<string>(ROOM_TINTS.brass);

  const value = useMemo<RoomTintValue>(
    () => ({
      tint,
      setRoomTint: (input) => {
        if (input == null) {
          setTint(ROOM_TINTS.brass);
          return;
        }
        if (input in ROOM_TINTS) {
          setTint(ROOM_TINTS[input as RoomTintName]);
          return;
        }
        setTint(input);
      },
    }),
    [tint],
  );

  return <RoomTintContext.Provider value={value}>{children}</RoomTintContext.Provider>;
}

export function useRoomTint(): RoomTintValue {
  const ctx = useContext(RoomTintContext);
  if (!ctx) {
    // Safe fallback — outside the provider we render brass and silently
    // ignore writes. Avoids hard crashes on non-3D-enabled routes.
    return { tint: ROOM_TINTS.brass, setRoomTint: () => undefined };
  }
  return ctx;
}
