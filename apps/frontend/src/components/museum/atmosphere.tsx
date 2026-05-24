'use client';

import { useEffect, useState } from 'react';
import { useAtmosphereStore } from '@/stores/atmosphere-store';

export function DynamicAtmosphere() {
  const { weather, lighting, intensity, isNight } = useAtmosphereStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const hour = new Date().getHours();
    if (hour >= 20 || hour <= 5) {
      useAtmosphereStore.getState().setNight(true);
      useAtmosphereStore.getState().setLighting('dark');
    }
  }, []);

  if (!mounted) return null;

  const weatherEffects: Record<string, string> = {
    mist: 'bg-gradient-to-b from-void/0 via-void/30 to-void/60',
    rain: 'bg-gradient-to-b from-blue-900/5 via-blue-900/10 to-void/60',
    calm: 'bg-gradient-to-b from-void/0 via-void/10 to-void/40',
    storm: 'bg-gradient-to-b from-purple-900/10 via-purple-900/15 to-void/60',
    fog: 'bg-gradient-to-b from-void/20 via-whisper/5 to-void/60',
  };

  const lightingEffects: Record<string, string> = {
    dim: 'brightness-[0.6]',
    dark: 'brightness-[0.3]',
    warm: 'brightness-[0.7] sepia-[0.2]',
    cool: 'brightness-[0.6] hue-rotate-[200deg] saturate-[0.5]',
    flicker: 'brightness-[0.6]',
  };

  return (
    <>
      <div
        className={`fixed inset-0 pointer-events-none z-[1] transition-all duration-1000 ${weatherEffects[weather] || weatherEffects.mist}`}
      />

      <div
        className={`fixed inset-0 pointer-events-none z-[2] transition-all duration-2000 ${lightingEffects[lighting] || lightingEffects.dim}`}
      />

      {isNight && (
        <div className="fixed inset-0 pointer-events-none z-[3] bg-blue-900/5 transition-opacity duration-2000" />
      )}

      {intensity === 'heavy' && (
        <div className="fixed inset-0 pointer-events-none z-[3] bg-gradient-to-b from-transparent via-red-900/5 to-void/30 animate-pulse-slow" />
      )}
    </>
  );
}
