'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/audio-store';
import {
  startAmbience,
  stopAmbience,
  setAmbienceVolume,
  AMBIENCE_PRESETS,
} from '@/lib/ambient-engine';

/**
 * Map of room ambience keys to optional public audio assets. If a real
 * recording exists at the given path it will be preferred over the
 * procedural drone — but the museum is fully audible without any
 * MP3 files present.
 */
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

/**
 * Probes whether a real recording exists at the given URL via HEAD.
 * Treats any non-2xx as "not present" and silently falls back to the
 * procedural engine.
 */
async function probeTrack(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

/** Boots once on first user gesture: required by browser autoplay policies. */
export function AudioManager() {
  const initializedRef = useRef(false);

  useEffect(() => {
    const init = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;
      // Touching the AudioContext via the engine is enough; the engine
      // creates it lazily inside startAmbience.
    };

    document.addEventListener('click', init, { once: true });
    document.addEventListener('touchstart', init, { once: true });

    return () => {
      document.removeEventListener('click', init);
      document.removeEventListener('touchstart', init);
      stopAmbience();
    };
  }, []);

  return null;
}

/**
 * Plays ambient sound for a given room key. Prefers a real /audio file
 * if one is shipped under apps/frontend/public/audio; otherwise uses
 * the procedural engine.
 */
export function useAmbientSound(trackKey: string = 'default') {
  const { isMuted, volume } = useAudioStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const usingProceduralRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const targetVolume = isMuted ? 0 : volume;
    const url = ATMOSPHERE_TRACKS[trackKey] || ATMOSPHERE_TRACKS.default;

    (async () => {
      const real = url ? await probeTrack(url) : false;
      if (cancelled) return;

      if (real && url) {
        usingProceduralRef.current = false;
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = targetVolume;
        audioRef.current = audio;
        audio.play().catch(() => {});
      } else {
        usingProceduralRef.current = true;
        await startAmbience(trackKey, targetVolume);
      }
    })();

    return () => {
      cancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
      if (usingProceduralRef.current) {
        stopAmbience();
        usingProceduralRef.current = false;
      }
    };
    // We restart on track change; volume/mute are reflected by the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackKey]);

  useEffect(() => {
    const target = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = target;
    }
    if (usingProceduralRef.current) {
      setAmbienceVolume(target);
    }
  }, [isMuted, volume]);

  return audioRef;
}

export { AMBIENCE_PRESETS };
