'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

/**
 * Lamplit Archive — Layer 2 artifact families.
 *
 * Six low-poly groups that cover the 15 exhibit categories. Each family
 * is a tiny composition of THREE primitives with a warm brass-tinted
 * material. They spin slowly on Y to give a museum-pedestal feel.
 *
 * v1 keeps these intentionally schematic — refined sculpting comes in
 * a follow-up. Treat each family as a placeholder silhouette that
 * communicates the category at a glance.
 *
 * Usage (any of these inside a `<group position={...}>` parented to
 * the shared canvas):
 *
 *   <BrokenInstrument />
 *   <SealedLetter />
 */

// ---- Shared materials ----------------------------------------------------

function brassMaterial() {
  return (
    <meshStandardMaterial
      color="#A8794B"
      metalness={0.55}
      roughness={0.45}
      envMapIntensity={0.6}
    />
  );
}

function inkMaterial() {
  return <meshStandardMaterial color="#171514" metalness={0.1} roughness={0.7} />;
}

function paperMaterial() {
  return <meshStandardMaterial color="#FBF7EE" metalness={0} roughness={0.95} />;
}

// ---- Slow pedestal-spin shared helper -----------------------------------

function useSlowSpin(speed = 0.18) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });
  return ref;
}

// ---- Family 1: Broken Instrument (Career, Side Project, Creative) -------

export function BrokenInstrument() {
  const ref = useSlowSpin();
  return (
    <group ref={ref}>
      {/* Microphone capsule */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        {brassMaterial()}
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.7, 12]} />
        {inkMaterial()}
      </mesh>
      {/* Snapped piece beside it */}
      <mesh position={[0.18, -0.34, 0.08]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
        {inkMaterial()}
      </mesh>
    </group>
  );
}

// ---- Family 2: Sealed Letter (Relationship, Family, Heartbreak) ---------

export function SealedLetter() {
  const ref = useSlowSpin();
  return (
    <group ref={ref} rotation={[-0.25, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.7, 0.45, 0.02]} />
        {paperMaterial()}
      </mesh>
      {/* Wax seal */}
      <mesh position={[0, 0, 0.012]}>
        <cylinderGeometry args={[0.06, 0.06, 0.01, 24]} />
        <meshStandardMaterial color="#9C5544" metalness={0.1} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ---- Family 3: Fading Photograph (Missed Opportunity, Identity, Dream) --

export function FadingPhotograph() {
  const ref = useSlowSpin(0.12);
  return (
    <group ref={ref} rotation={[0.3, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.55, 0.7, 0.015]} />
        {paperMaterial()}
      </mesh>
      {/* "Image" pane — vellum tone */}
      <mesh position={[0, 0.05, 0.009]}>
        <planeGeometry args={[0.42, 0.5]} />
        <meshStandardMaterial color="#EAE3D4" roughness={1} />
      </mesh>
      {/* Bottom caption strip */}
      <mesh position={[0, -0.27, 0.009]}>
        <planeGeometry args={[0.42, 0.06]} />
        <meshStandardMaterial color="#9C9183" roughness={1} />
      </mesh>
    </group>
  );
}

// ---- Family 4: Severed Thread (Burnout, Mental, Interview) --------------

export function SeveredThread() {
  const ref = useSlowSpin(0.22);
  return (
    <group ref={ref}>
      {/* Spool */}
      <mesh position={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.18, 24]} />
        {brassMaterial()}
      </mesh>
      {/* Thread arc — torus partial */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.005, 8, 32, Math.PI * 0.7]} />
        {inkMaterial()}
      </mesh>
      {/* Cut end falling away */}
      <mesh position={[0.28, -0.08, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.005, 0.005, 0.14, 8]} />
        {inkMaterial()}
      </mesh>
    </group>
  );
}

// ---- Family 5: Locked Box (Financial, Academic, Startup) ----------------

export function LockedBox() {
  const ref = useSlowSpin();
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.55, 0.4, 0.4]} />
        <meshStandardMaterial color="#5C534A" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* Brass strap */}
      <mesh position={[0, 0, 0.21]}>
        <boxGeometry args={[0.08, 0.42, 0.005]} />
        {brassMaterial()}
      </mesh>
      {/* Padlock */}
      <mesh position={[0, -0.05, 0.23]}>
        <boxGeometry args={[0.08, 0.1, 0.04]} />
        {brassMaterial()}
      </mesh>
      <mesh position={[0, 0.04, 0.23]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.012, 8, 24, Math.PI]} />
        {brassMaterial()}
      </mesh>
    </group>
  );
}

// ---- Family 6: Dust-Veiled Frame (Betrayal, Career Regret, fallback) ----

export function DustVeiledFrame() {
  const ref = useSlowSpin(0.1);
  return (
    <group ref={ref}>
      {/* Outer frame */}
      <mesh>
        <boxGeometry args={[0.7, 0.55, 0.04]} />
        {brassMaterial()}
      </mesh>
      {/* Inset */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.5, 0.38, 0.005]} />
        <meshStandardMaterial color="#171514" roughness={0.95} />
      </mesh>
      {/* Faint diagonal "veil" — translucent plane */}
      <mesh position={[0, 0, 0.04]} rotation={[0, 0, 0.1]}>
        <planeGeometry args={[0.78, 0.08]} />
        <meshStandardMaterial color="#FBF7EE" transparent opacity={0.18} roughness={1} />
      </mesh>
    </group>
  );
}
