'use client';

import { useEffect } from 'react';
import { useAtmosphereStore } from '@/stores/atmosphere-store';

interface RoomAtmosphereProps {
  roomSlug: string;
  lighting?: string;
  ambience?: string;
}

type Lighting = 'dim' | 'dark' | 'warm' | 'cool' | 'flicker';
type Weather = 'mist' | 'rain' | 'calm' | 'storm' | 'fog';
type Intensity = 'calm' | 'heavy' | 'intense' | 'peaceful';

export function RoomAtmosphere({ roomSlug, lighting, ambience }: RoomAtmosphereProps) {
  const { setLighting, setWeather, setIntensity } = useAtmosphereStore();

  useEffect(() => {
    const roomAtmospheres: Record<
      string,
      { lighting: Lighting; weather: Weather; intensity: Intensity }
    > = {
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

    setLighting((lighting as Lighting) || atmosphere.lighting);
    setWeather(atmosphere.weather);
    setIntensity(atmosphere.intensity);

    return () => {
      setLighting('dim');
      setWeather('mist');
      setIntensity('calm');
    };
  }, [roomSlug, lighting, ambience, setLighting, setWeather, setIntensity]);

  return null;
}
