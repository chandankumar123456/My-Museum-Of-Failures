'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, type ReactNode } from 'react';
import { AmbientShader } from './ambient-shader';

/**
 * Lamplit Archive — Root Canvas.
 *
 * A single shared `<Canvas>` mounted full-viewport, fixed, behind every
 * page (z-0). All Layer-1/2/3 3D content lives inside this one canvas:
 * we do NOT mount a per-page canvas. This is critical for memory + perf
 * on lower-end devices.
 *
 * - `frameloop="demand"` is the default; set-pieces opt in to "always"
 *   when they need a continuous loop (e.g. the ambient shader uniform).
 * - DPR is capped at 1.5 to prevent retina scorching.
 * - `gl.alpha = true` so the bone canvas underneath shows through.
 *
 * Wire this into `layout.tsx` once, fixed-positioned. Page-level set
 * pieces register via portals using `<SetPiece />` (TBD in Wave D-7).
 */
export function RootCanvas({ children }: { children?: ReactNode }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ contain: 'strict' }}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <AmbientShader />
          {/* Subtle 3-point museum lighting for any registered set piece.
              Brass key from upper-right, paper fill, low ink rim. */}
          <ambientLight intensity={0.35} color="#FBF7EE" />
          <directionalLight
            position={[3, 4, 4]}
            intensity={0.9}
            color="#F4EFE6"
          />
          <pointLight position={[-2, 1, 3]} intensity={0.4} color="#A8794B" />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
