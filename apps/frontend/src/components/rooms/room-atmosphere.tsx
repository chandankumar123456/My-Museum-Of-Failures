'use client';

import { useEffect } from 'react';
import { useAtmosphereStore } from '@/stores/atmosphere-store';
import { useAudioStore } from '@/stores/audio-store';

interface RoomAtmosphereProps {
  roomSlug: string;
  lighting?: string;
  ambience?: string;
}

export function RoomAtmosphere({ roomSlug, lighting, ambience }: RoomAtmosphereProps) {
  const { setLighting, setWeather, setIntensity } = useAtmosphereStore();

  useEffect(() => {
    const roomAtmospheres: Record<string, { lighting: string; weather: string; intensity: string }> = {
      hall_of_broken_dreams: { lighting: 'dim', weather: 'mist', intensity: 'calm' },
      startup_cemetery: { lighting: 'flicker', weather: 'fog', intensity: 'heavy' },
      burnout_basement: { lighting: 'dark', weather: 'fog', intensity: 'heavy' },
      academic_ruins: { lighting: 'dim', weather: 'calm', intensity: 'calm' },
      gallery_of_lost_potential: { lighting: 'warm', weather: 'mist', intensity: 'peaceful' },
      the_regret_archive: { lighting: 'dim', weather: 'fog', intensity: 'heavy' },
      abandoned_futures_wing: { lighting: 'cool', weather: 'storm', intensity: 'intense' },
      relationship_graveyard: { lighting: 'dark', weather: 'rain', intensity: 'heavy' },
    };

    const atmosphere = roomAtmospheres[roomSlug] || roomAtmospheres.hall_of_broken_dreams;

    setLighting(lighting || atmosphere.lighting as any);
    setWeather(atmosphere.weather as any);
    setIntensity(atmosphere.intensity as any);

    return () => {
      setLighting('dim');
      setWeather('mist');
      setIntensity('calm');
    };
  }, [roomSlug, lighting, ambience, setLighting, setWeather, setIntensity]);

  return null;
}
