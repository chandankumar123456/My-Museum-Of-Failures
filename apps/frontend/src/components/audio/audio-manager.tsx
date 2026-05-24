'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/audio-store';

const ATMOSPHERE_TRACKS: Record<string, string> = {
  default: '/audio/museum-ambience.mp3',
  echoing_hall: '/audio/echoing-hall.mp3',
  cold_warehouse: '/audio/cold-warehouse.mp3',
  underground_hum: '/audio/underground-hum.mp3',
  library_echo: '/audio/library-echo.mp3',
  quiet_gallery: '/audio/quiet-gallery.mp3',
  archive_room: '/audio/archive-room.mp3',
  wind_tunnel: '/audio/wind-tunnel.mp3',
  rain_room: '/audio/rain-room.mp3',
};

export function AudioManager() {
  const { isMuted, volume, setPlaying, setTrack } = useAudioStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const initAudio = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        console.warn('Audio not available');
      }
    };

    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
      audioContextRef.current?.close();
    };
  }, []);

  return null;
}

export function useAmbientSound(trackKey: string = 'default') {
  const { isMuted, volume } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const track = ATMOSPHERE_TRACKS[trackKey] || ATMOSPHERE_TRACKS.default;
    if (!track) return;

    const audio = new Audio(track);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [trackKey]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  return audioRef;
}
