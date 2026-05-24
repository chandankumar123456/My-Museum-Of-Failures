'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MuseumRoomSceneProps {
  roomSlug: string;
}

export function MuseumRoom({ roomSlug }: MuseumRoomSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  const colors = useMemo(() => {
    const roomColors: Record<string, { floor: string; walls: string; accent: string }> = {
      hall_of_broken_dreams: { floor: '#2a2420', walls: '#1a1513', accent: '#d4592b' },
      startup_cemetery: { floor: '#1e1a18', walls: '#0d0b0a', accent: '#4a6fa5' },
      burnout_basement: { floor: '#1a1513', walls: '#0d0b0a', accent: '#8b3a3a' },
      relationship_graveyard: { floor: '#2a2420', walls: '#1a1513', accent: '#8b5a6a' },
    };
    return roomColors[roomSlug] || roomColors.hall_of_broken_dreams;
  }, [roomSlug]);

  return (
    <group ref={groupRef}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={colors.floor} roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2, -5]} receiveShadow>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={colors.walls} roughness={0.8} />
      </mesh>

      {/* Floating particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <FloatingParticle key={i} position={[
          (Math.random() - 0.5) * 8,
          Math.random() * 4,
          (Math.random() - 0.5) * 4,
        ]} />
      ))}

      {/* Display pedestals */}
      {[-2, 0, 2].map((x, i) => (
        <group key={i} position={[x, 0, -1]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.8]} />
            <meshStandardMaterial color={colors.accent} roughness={0.6} metalness={0.3} opacity={0.4} transparent />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.4, 0.05, 0.4]} />
            <meshStandardMaterial color="#c4bcb0" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FloatingParticle({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.02, 4, 4]} />
      <meshBasicMaterial color="#c4bcb0" opacity={0.3} transparent />
    </mesh>
  );
}
