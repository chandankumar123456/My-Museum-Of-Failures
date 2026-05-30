'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useRoomTint } from './room-context';

/**
 * Lamplit Archive — Layer 1 ambient shader.
 *
 * A single fullscreen plane locked to the camera. The fragment shader:
 *
 *   1. Mixes the bone canvas towards the active room tint with a soft
 *      vertical gradient (top is warmer, bottom is cooler).
 *   2. Adds a low-frequency FBM-flavoured value noise that drifts slowly,
 *      producing the "lit dust" feel without overpowering content.
 *   3. Adds a restrained vignette so corners settle into the page edge.
 *
 * Opacity sits around 0.18 so it never competes with the actual content;
 * the brass canvas underneath always reads first.
 *
 * The shader updates the `uTint` uniform any time the room context
 * changes, lerping smoothly over ~1.2 s.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Render directly in clip space — this plane covers the whole viewport
    // regardless of camera placement.
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3  uTint;
  uniform vec3  uBone;
  uniform float uOpacity;

  // Hash-based value noise — cheap and good enough for soft drift.
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    // Gentle vertical gradient — top pulls towards the tint, bottom stays
    // closer to bone.
    float grad = smoothstep(-0.1, 1.1, vUv.y);
    vec3 base = mix(uBone, uTint, grad * 0.35);

    // Slow drifting noise (time-based) gives the canvas a sense of
    // breathing without ever announcing itself.
    float n = noise(vUv * 3.0 + uTime * 0.04);
    base += (n - 0.5) * 0.04;

    // Soft vignette — the corners fall a touch toward ink.
    float r = distance(vUv, vec2(0.5));
    float vignette = smoothstep(0.85, 0.35, r);

    gl_FragColor = vec4(base, uOpacity * vignette);
  }
`;

const BONE = new THREE.Color('#F4EFE6');

export function AmbientShader() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const { tint } = useRoomTint();
  const { size } = useThree();
  const targetColor = useMemo(() => new THREE.Color(tint), [tint]);

  // Honor reduced-motion: still render the shader, but freeze time.
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useFrame((state) => {
    const mat = ref.current;
    if (!mat) return;
    if (!reducedMotion) {
      mat.uniforms.uTime.value = state.clock.elapsedTime;
    }
    // Lerp the tint uniform towards the target on each frame for smooth
    // room transitions.
    (mat.uniforms.uTint.value as THREE.Color).lerp(targetColor, 0.04);
  });

  // Memoise uniforms so the material isn't re-created on each render.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTint: { value: targetColor.clone() },
      uBone: { value: BONE.clone() },
      uOpacity: { value: 0.18 },
    }),
    // tint is intentionally not a dep — we lerp on the GPU side.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={ref}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        // Prevent the shader from being affected by `size` changes that
        // we don't actually need to react to. (size is read so the hook
        // stays subscribed to renderer events.)
        key={`${size.width}x${size.height}`}
      />
    </mesh>
  );
}
