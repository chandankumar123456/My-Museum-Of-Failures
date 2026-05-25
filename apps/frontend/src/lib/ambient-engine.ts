'use client';

/**
 * Procedural ambient sound engine.
 *
 * Each museum room has a personality but shipping eight high-quality
 * ambient loops as binary assets is a real production task. Until a
 * sound designer ships those files, this engine synthesizes a unique
 * drone for each room at runtime using the Web Audio API.
 *
 * The generator stitches together:
 *   - 1-3 detuned sine/triangle oscillators (the drone tone)
 *   - a low-pass filter (room "weight")
 *   - a slow LFO modulating filter cutoff (breathing)
 *   - shaped white noise (environmental texture: rain, wind, hum)
 *   - a master gain envelope (slow fade in/out)
 *
 * If /audio/<key>.mp3 exists in /public/audio at runtime, it is
 * preferred over the procedural drone (HEAD probe on first play).
 */

export type AmbiencePreset = {
  /** Stable key matching MuseumRoom.ambience and TRACKS in audio-manager. */
  key: string;
  /** Base oscillator frequencies in Hz. Each becomes a layer. */
  tones: number[];
  /** 0..1, master volume cap. */
  volume: number;
  /** Low-pass filter cutoff (Hz). Lower = heavier, dimmer rooms. */
  cutoff: number;
  /** White-noise loudness, 0..1. */
  noise: number;
  /** Optional band-pass center for shaped noise (rain ~ 1200Hz, wind ~ 350Hz). */
  noiseBand?: number;
  /** Cents of detune across layers, jitters tone for organic feel. */
  detune?: number;
};

export const AMBIENCE_PRESETS: Record<string, AmbiencePreset> = {
  default: { key: 'default', tones: [110, 165], volume: 0.18, cutoff: 1200, noise: 0.04 },
  echoing_hall: { key: 'echoing_hall', tones: [98, 147, 196], volume: 0.16, cutoff: 900, noise: 0.03, detune: 8 },
  cold_warehouse: { key: 'cold_warehouse', tones: [73, 110], volume: 0.14, cutoff: 700, noise: 0.06, noiseBand: 600 },
  underground_hum: { key: 'underground_hum', tones: [55, 82], volume: 0.2, cutoff: 500, noise: 0.05, noiseBand: 200 },
  library_echo: { key: 'library_echo', tones: [130, 196], volume: 0.12, cutoff: 1500, noise: 0.02 },
  quiet_gallery: { key: 'quiet_gallery', tones: [165, 220, 247], volume: 0.1, cutoff: 1800, noise: 0.02, detune: 6 },
  archive_room: { key: 'archive_room', tones: [110, 138], volume: 0.15, cutoff: 800, noise: 0.04, noiseBand: 1500 },
  wind_tunnel: { key: 'wind_tunnel', tones: [82, 123], volume: 0.18, cutoff: 600, noise: 0.12, noiseBand: 350 },
  rain_room: { key: 'rain_room', tones: [98, 130], volume: 0.16, cutoff: 1100, noise: 0.18, noiseBand: 1200 },
};

interface ActiveAmbience {
  ctx: AudioContext;
  master: GainNode;
  oscs: OscillatorNode[];
  noise?: AudioBufferSourceNode;
  lfo?: OscillatorNode;
  preset: AmbiencePreset;
}

let active: ActiveAmbience | null = null;

function makeNoiseBuffer(ctx: AudioContext, seconds = 2) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export async function startAmbience(key: string, volume: number): Promise<void> {
  await stopAmbience();

  const preset = AMBIENCE_PRESETS[key] ?? AMBIENCE_PRESETS.default;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;

  const ctx = new Ctx();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* user-gesture required; fail silent */
    }
  }

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Shared low-pass for the whole drone: gives each room its "weight".
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = preset.cutoff;
  filter.Q.value = 0.7;
  filter.connect(master);

  // Slow LFO modulates the filter cutoff so the room "breathes".
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.06; // ~17s breath cycle
  lfoGain.gain.value = preset.cutoff * 0.25;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  // Drone layers.
  const oscs: OscillatorNode[] = [];
  preset.tones.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = i % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    if (preset.detune) osc.detune.value = (i - preset.tones.length / 2) * preset.detune;

    const gain = ctx.createGain();
    gain.gain.value = preset.volume / preset.tones.length;
    osc.connect(gain).connect(filter);
    osc.start();
    oscs.push(osc);
  });

  // Optional shaped white noise.
  let noiseSource: AudioBufferSourceNode | undefined;
  if (preset.noise > 0) {
    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = makeNoiseBuffer(ctx);
    noiseSource.loop = true;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = preset.noise;

    if (preset.noiseBand) {
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = preset.noiseBand;
      band.Q.value = 0.8;
      noiseSource.connect(band).connect(noiseGain).connect(master);
    } else {
      noiseSource.connect(noiseGain).connect(master);
    }
    noiseSource.start();
  }

  // Slow fade-in.
  const target = Math.max(0, Math.min(1, volume));
  master.gain.linearRampToValueAtTime(target, ctx.currentTime + 1.5);

  active = { ctx, master, oscs, noise: noiseSource, lfo, preset };
}

export async function stopAmbience(): Promise<void> {
  if (!active) return;
  const { ctx, master, oscs, noise, lfo } = active;
  active = null;

  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);

  setTimeout(() => {
    try {
      oscs.forEach((o) => o.stop());
      noise?.stop();
      lfo?.stop();
      ctx.close().catch(() => {});
    } catch {
      /* noop */
    }
  }, 700);
}

export function setAmbienceVolume(volume: number) {
  if (!active) return;
  const target = Math.max(0, Math.min(1, volume));
  active.master.gain.cancelScheduledValues(active.ctx.currentTime);
  active.master.gain.linearRampToValueAtTime(target, active.ctx.currentTime + 0.3);
}
