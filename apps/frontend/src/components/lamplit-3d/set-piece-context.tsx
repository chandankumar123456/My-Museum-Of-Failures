'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Lamplit Archive — Layer 3 set-piece registration.
 *
 * Each page can mount a single signature 3D set piece (the lamp + drawer
 * for landing, the cabinet corridor for /rooms, the velvet plaque for
 * /legacy, and so on). The page wraps its scene in `<SetPiece>` and the
 * shared `<RootCanvas>` reads from this context to render it.
 *
 * Only one set piece is active at a time. Mounting a new one replaces
 * the previous; unmounting clears the slot.
 *
 *   // In a page component:
 *   <SetPiece>
 *     <LandingHeroSetPiece />
 *   </SetPiece>
 */

interface SetPieceContextValue {
  node: ReactNode | null;
  setNode: (node: ReactNode | null) => void;
}

const SetPieceContext = createContext<SetPieceContextValue | null>(null);

export function SetPieceProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<ReactNode | null>(null);
  const value = useMemo(() => ({ node, setNode }), [node]);
  return <SetPieceContext.Provider value={value}>{children}</SetPieceContext.Provider>;
}

export function useSetPiece(): SetPieceContextValue {
  const ctx = useContext(SetPieceContext);
  if (!ctx) {
    return { node: null, setNode: () => undefined };
  }
  return ctx;
}

/**
 * Mount the contained 3D scene as the active set piece. Only one
 * `<SetPiece>` should be rendered at a time per route.
 */
export function SetPiece({ children }: { children: ReactNode }) {
  const { setNode } = useSetPiece();

  useEffect(() => {
    setNode(children);
    return () => setNode(null);
  }, [children, setNode]);

  return null;
}
