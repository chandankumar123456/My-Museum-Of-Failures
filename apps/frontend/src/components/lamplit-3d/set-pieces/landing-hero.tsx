'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { SealedLetter } from '../artifacts/families';

/**
 * Lamplit Archive — Landing hero set piece.
 *
 * The signature scene for `/`. A brass desk lamp throws warm light onto
 * a tipped-open archive drawer; a sealed letter rests on the surface.
 * Slowly drifts left-right with a tiny tilt to keep the canvas alive.
 *
 *   <SetPiece>
 *     <LandingHeroSetPiece />
 *   </SetPiece>
 */
export function LandingHeroSetPiece() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.x = 1.3 + Math.sin(t * 0.18) * 0.04;
    g.rotation.y = -0.18 + Math.sin(t * 0.12) * 0.015;
  });

  return (
    <group ref={group} position={[1.3, -0.1, 0]} rotation={[0, -0.18, 0]} scale={0.9}>
      <Drawer />
      <DeskLamp position={[-0.85, 0.1, 0.25]} />
      {/* Sealed letter parked on the desktop, just outside the drawer. */}
      <group position={[0.15, 0.08, 0.45]} rotation={[Math.PI / 2.6, 0.1, 0.2]} scale={0.7}>
        <SealedLetter />
      </group>
      {/* Soft warm pool of light cast by the lamp — fake light decal. */}
      <mesh
        position={[-0.4, -0.05, 0.55]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color="#F4EFE6" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

// ---- Drawer ---------------------------------------------------------------

function Drawer() {
  return (
    <group>
      {/* Desk surface */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.1, 1.2]} />
        <meshStandardMaterial color="#5C534A" roughness={0.85} />
      </mesh>
      {/* Drawer body — tilted up slightly */}
      <group position={[0.05, 0.06, -0.05]} rotation={[0.05, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 0.32, 0.85]} />
          <meshStandardMaterial color="#7C5532" roughness={0.7} />
        </mesh>
        {/* Inner well */}
        <mesh position={[0, 0.02, 0.02]}>
          <boxGeometry args={[1.32, 0.28, 0.78]} />
          <meshStandardMaterial color="#171514" roughness={0.95} />
        </mesh>
        {/* Brass pull on the front */}
        <mesh position={[0, -0.03, 0.43]}>
          <boxGeometry args={[0.18, 0.05, 0.04]} />
          <meshStandardMaterial color="#A8794B" metalness={0.55} roughness={0.4} />
        </mesh>
        {/* A folded paper inside the drawer */}
        <mesh position={[0.2, 0.16, 0.05]} rotation={[-Math.PI / 2, 0, 0.15]}>
          <planeGeometry args={[0.45, 0.3]} />
          <meshStandardMaterial color="#FBF7EE" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.25, 0.16, -0.1]} rotation={[-Math.PI / 2, 0, -0.25]}>
          <planeGeometry args={[0.4, 0.28]} />
          <meshStandardMaterial color="#EAE3D4" roughness={1} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ---- Desk Lamp ------------------------------------------------------------

function DeskLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 24]} />
        <meshStandardMaterial color="#171514" roughness={0.9} />
      </mesh>
      {/* Stem (slightly bent, two segments) */}
      <mesh position={[0.05, 0.3, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.55, 12]} />
        <meshStandardMaterial color="#A8794B" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0.18, 0.55, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 12]} />
        <meshStandardMaterial color="#A8794B" metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Shade — open cone */}
      <mesh position={[0.32, 0.7, 0]} rotation={[0, 0, -1.1]}>
        <coneGeometry args={[0.18, 0.28, 24, 1, true]} />
        <meshStandardMaterial
          color="#A8794B"
          metalness={0.55}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0.34, 0.68, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#FBF7EE" />
      </mesh>
      {/* Local point light for the warm cast */}
      <pointLight
        position={[0.32, 0.62, 0]}
        intensity={1.6}
        distance={2.2}
        decay={2}
        color="#F4D7A6"
      />
    </group>
  );
}
