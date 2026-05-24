import { create } from 'zustand';

interface AtmosphereState {
  weather: 'mist' | 'rain' | 'calm' | 'storm' | 'fog';
  lighting: 'dim' | 'dark' | 'warm' | 'cool' | 'flicker';
  intensity: 'calm' | 'heavy' | 'intense' | 'peaceful';
  isNight: boolean;
  setWeather: (weather: AtmosphereState['weather']) => void;
  setLighting: (lighting: AtmosphereState['lighting']) => void;
  setIntensity: (intensity: AtmosphereState['intensity']) => void;
  setNight: (isNight: boolean) => void;
}

export const useAtmosphereStore = create<AtmosphereState>((set) => ({
  weather: 'mist',
  lighting: 'dim',
  intensity: 'calm',
  isNight: false,
  setWeather: (weather) => set({ weather }),
  setLighting: (lighting) => set({ lighting }),
  setIntensity: (intensity) => set({ intensity }),
  setNight: (isNight) => set({ isNight }),
}));
