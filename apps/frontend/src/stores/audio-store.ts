import { create } from 'zustand';

interface AudioState {
  isMuted: boolean;
  volume: number;
  currentTrack: string | null;
  isPlaying: boolean;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setTrack: (track: string | null) => void;
  setPlaying: (playing: boolean) => void;
  toggleMute: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: false,
  volume: 0.3,
  currentTrack: null,
  isPlaying: false,
  setMuted: (isMuted) => set({ isMuted }),
  setVolume: (volume) => set({ volume }),
  setTrack: (currentTrack) => set({ currentTrack }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
}));
