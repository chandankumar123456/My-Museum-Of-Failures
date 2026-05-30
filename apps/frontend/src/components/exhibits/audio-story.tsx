'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { AudioStoryView, TranscriptSegment, EmotionPoint } from '@museum/shared';
import { api } from '@/lib/api';
import { Eyebrow, EngravedDivider } from '@/components/lamplit';
import { fadeUp } from '@/lib/motion';

interface Props {
  exhibitId: string;
}

type Status = 'idle' | 'loading' | 'uploading' | 'transcribing' | 'processing' | 'ready' | 'error';

export function AudioStory({ exhibitId }: Props) {
  const [story, setStory] = useState<AudioStoryView | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = (await api.audio.get(exhibitId)) as AudioStoryView | null;
      setStory(data);
      setStatus(data?.status === 'ready' ? 'ready' : data ? (data.status as Status) : 'idle');
    } catch {
      setStatus('idle');
    }
  }, [exhibitId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    setStatus('uploading');
    setError('');
    try {
      const uploaded = (await api.audio.upload(exhibitId, file)) as AudioStoryView;
      setStory(uploaded);
      setStatus('transcribing');
      const processed = (await api.audio.process(exhibitId)) as AudioStoryView | null;
      if (processed) {
        setStory(processed);
        setStatus(processed.status === 'ready' ? 'ready' : (processed.status as Status));
      }
    } catch {
      setError('Upload or processing failed. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="bg-paper border border-glass-edge rounded-lg p-8 animate-pulse">
        <div className="h-4 bg-vellum rounded w-1/3" />
      </div>
    );
  }

  return (
    <motion.section variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      <EngravedDivider label="// AUDIO STORY" />

      {status === 'idle' || status === 'error' ? (
        <UploadControl onUpload={handleUpload} error={error} />
      ) : status === 'ready' && story ? (
        <Player story={story} />
      ) : (
        <ProcessingIndicator status={status} />
      )}
    </motion.section>
  );
}

// ---- Upload Control -------------------------------------------------------

function UploadControl({ onUpload, error }: { onUpload: (f: File) => void; error: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-paper border border-glass-edge rounded-lg p-8 text-center space-y-4">
      <Eyebrow>Record your story</Eyebrow>
      <p className="font-sans text-[13px] text-ink-muted max-w-[42ch] mx-auto">
        Upload an audio recording of your failure story. It will be transcribed and analyzed.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        aria-label="Upload audio file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brass/10 border border-brass/30 rounded text-brass font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-brass/20 transition-colors"
        aria-label="Choose audio file to upload"
      >
        Choose audio file
      </button>
      {error && <p className="font-mono text-[11px] tracking-tight text-rust">{error}</p>}
    </div>
  );
}

// ---- Processing Indicator -------------------------------------------------

function ProcessingIndicator({ status }: { status: Status }) {
  const labels: Record<string, string> = {
    uploading: 'Uploading audio…',
    transcribing: 'Transcribing with Whisper…',
    processing: 'Analyzing emotions & lessons…',
    uploaded: 'Preparing…',
  };

  return (
    <div className="bg-paper border border-glass-edge rounded-lg p-8 text-center space-y-3">
      <div className="w-6 h-6 border-2 border-brass border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-whisper">
        {labels[status] ?? 'Processing…'}
      </p>
    </div>
  );
}

// ---- Player ---------------------------------------------------------------

function Player({ story }: { story: AudioStoryView }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(story.duration ?? 0);
  const [speed, setSpeed] = useState(1);
  const [search, setSearch] = useState('');

  const transcript = (story.transcript ?? []) as TranscriptSegment[];
  const emotions = (story.emotionTimeline ?? []) as EmotionPoint[];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration || story.duration || 0);
    const onEnd = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDur);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDur);
      audio.removeEventListener('ended', onEnd);
    };
  }, [story.duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  };

  const seek = (t: number) => {
    const audio = audioRef.current;
    if (audio) { audio.currentTime = t; setCurrentTime(t); }
  };

  const changeSpeed = (s: number) => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const activeIdx = transcript.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end,
  );

  const filtered = search
    ? transcript.filter((s) => s.text.toLowerCase().includes(search.toLowerCase()))
    : transcript;

  return (
    <div className="bg-paper border border-glass-edge rounded-lg p-8 space-y-8">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={story.url ?? undefined} preload="metadata" />

      {/* Controls */}
      <div className="space-y-4">
        <Eyebrow>Audio playback</Eyebrow>
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-brass/40 text-brass hover:bg-brass/10 transition-colors"
            aria-label={playing ? 'Pause audio' : 'Play audio'}
          >
            {playing ? '❚❚' : '▶'}
          </button>

          {/* Seek slider */}
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 h-1 accent-brass cursor-pointer"
            aria-label="Seek audio position"
          />

          <span className="font-mono text-[11px] text-whisper min-w-[70px] text-right">
            {fmtTime(currentTime)} / {fmtTime(duration)}
          </span>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-whisper">Speed</span>
          {[0.5, 1, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => changeSpeed(s)}
              className={`px-2 py-0.5 font-mono text-[10px] rounded border transition-colors ${
                speed === s
                  ? 'border-brass text-brass bg-brass/10'
                  : 'border-glass-edge text-whisper hover:text-brass'
              }`}
              aria-label={`Set playback speed to ${s}x`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {story.summary && (
        <div className="space-y-2">
          <Eyebrow>AI Summary</Eyebrow>
          <p className="font-display text-[15px] leading-relaxed text-ink italic">
            {story.summary}
          </p>
        </div>
      )}

      {/* Lessons */}
      {story.lessons && story.lessons.length > 0 && (
        <div className="space-y-2">
          <Eyebrow>Lessons extracted</Eyebrow>
          <ul className="space-y-1">
            {story.lessons.map((l, i) => (
              <li key={i} className="font-sans text-[13px] text-ink-muted pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-brass">
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Emotion Timeline SVG */}
      {emotions.length > 0 && (
        <div className="space-y-2">
          <Eyebrow>Emotion timeline</Eyebrow>
          <EmotionTimelineSVG emotions={emotions} duration={duration} currentTime={currentTime} onSeek={seek} />
        </div>
      )}

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Eyebrow>Transcript</Eyebrow>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-transparent border border-glass-edge rounded px-3 py-1 font-mono text-[11px] text-ink placeholder:text-whisper/50 w-40 focus:outline-none focus:border-brass/50"
              aria-label="Search transcript"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 pr-2">
            {filtered.map((seg, i) => {
              const origIdx = transcript.indexOf(seg);
              const isActive = origIdx === activeIdx;
              return (
                <button
                  key={i}
                  onClick={() => seek(seg.start)}
                  className={`w-full text-left px-3 py-1.5 rounded text-[13px] transition-colors ${
                    isActive
                      ? 'bg-brass/10 border border-brass/30 text-ink'
                      : 'hover:bg-vellum/50 text-ink-muted'
                  }`}
                  aria-label={`Seek to ${fmtTime(seg.start)}`}
                >
                  <span className="font-mono text-[10px] text-whisper mr-2">
                    {fmtTime(seg.start)}
                  </span>
                  {seg.text}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Emotion Timeline SVG -------------------------------------------------

function EmotionTimelineSVG({
  emotions,
  duration,
  currentTime,
  onSeek,
}: {
  emotions: EmotionPoint[];
  duration: number;
  currentTime: number;
  onSeek: (t: number) => void;
}) {
  const width = 400;
  const height = 60;
  const dur = duration || emotions[emotions.length - 1]?.time || 1;

  const points = emotions.map((e) => ({
    x: (e.time / dur) * width,
    y: height - (e.intensity / 100) * height,
  }));

  const pathD = points.length > 0
    ? `M${points[0].x},${height} ` +
      points.map((p) => `L${p.x},${p.y}`).join(' ') +
      ` L${points[points.length - 1].x},${height} Z`
    : '';

  const lineD = points.length > 0
    ? `M${points.map((p) => `${p.x},${p.y}`).join(' L')}`
    : '';

  const playheadX = (currentTime / dur) * width;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = (x / rect.width) * dur;
    onSeek(Math.max(0, Math.min(dur, t)));
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-16 cursor-pointer"
      aria-label="Emotion intensity timeline"
      onClick={handleClick}
    >
      <path d={pathD} fill="rgba(180,155,100,0.12)" />
      <path d={lineD} fill="none" stroke="var(--color-brass, #b49b64)" strokeWidth="1.5" />
      {/* Playhead */}
      <line
        x1={playheadX}
        y1={0}
        x2={playheadX}
        y2={height}
        stroke="var(--color-brass, #b49b64)"
        strokeWidth="1"
        opacity={0.6}
      />
      {/* Emotion labels */}
      {emotions.map((e, i) => (
        <title key={i}>{`${fmtTime(e.time)}: ${e.emotion} (${e.intensity}%)`}</title>
      ))}
    </svg>
  );
}

// ---- Helpers --------------------------------------------------------------

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
