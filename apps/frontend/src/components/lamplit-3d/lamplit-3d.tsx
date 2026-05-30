'use client';

import dynamic from 'next/dynamic';
import { RoomTintProvider } from './room-context';
import { SetPieceProvider, useSetPiece } from './set-piece-context';
import type { ReactNode } from 'react';

/**
 * Lamplit Archive — Lamplit3D mount point.
 *
 * Wraps the page tree with the room-tint provider, the set-piece registry,
 * and mounts the shared 3D canvas (lazy-loaded, client-only). Used once
 * in `layout.tsx`.
 *
 * The canvas is rendered behind page content via `pointer-events: none` +
 * `position: fixed; inset: 0; z-index: 0`; the page content sits on top
 * inside a `relative z-10` wrapper.
 */

// Avoid SSR for the Canvas — three.js wants `window` + WebGL.
const RootCanvas = dynamic(
  () => import('./root-canvas').then((m) => m.RootCanvas),
  { ssr: false },
);

function CanvasWithSetPiece() {
  const { node } = useSetPiece();
  return <RootCanvas>{node}</RootCanvas>;
}

export function Lamplit3D({ children }: { children: ReactNode }) {
  return (
    <RoomTintProvider>
      <SetPieceProvider>
        <CanvasWithSetPiece />
        <div className="relative z-10">{children}</div>
      </SetPieceProvider>
    </RoomTintProvider>
  );
}
