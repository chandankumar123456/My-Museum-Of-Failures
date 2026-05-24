'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { MuseumRoom } from './museum-room-scene';

export function Museum3DView({ roomSlug = 'hall_of_broken_dreams' }: { roomSlug?: string }) {
  return (
    <div className="w-full h-[600px] rounded-sm overflow-hidden border border-museum-800">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 2, 8]} />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={3}
            maxDistance={15}
          />
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#d4592b" />
          <pointLight position={[-3, 2, -3]} intensity={0.3} color="#8a7b63" />
          <MuseumRoom roomSlug={roomSlug} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={0.5} />
            <Vignette eskil={false} offset={0.3} darkness={0.8} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
