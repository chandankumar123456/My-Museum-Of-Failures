'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AIReflectionView } from '@museum/shared';
import { api } from '@/lib/api';
import { CURATOR_PERSONAS } from '@/lib/constants';
import { Eyebrow, EngravedDivider, Tag } from '@/components/lamplit';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/lib/motion';

/**
 * Lamplit Archive — ReflectionPanel (Feature 2: Multi-Persona Curators).
 *
 * One exhibit, six lenses. The default "Curator" tab auto-generates on mount
 * (preserving prior behaviour); the five persona tabs (Historian, Engineer,
 * Therapist, Founder, Philosopher) generate lazily the first time they're
 * opened and are cached in component state for the session. The backend
 * additionally persists one reflection per (exhibit, persona), so the LLM is
 * never called twice for the same lens.
 *
 * Visual language is unchanged: Fraunces italic summary, mono-caps engraved
 * tags for patterns, body-essay reframing/observations.
 */

interface Props {
  exhibitId: string;
}

export function ReflectionPanel({ exhibitId }: Props) {
  // '' = default curator; other values map to the backend CuratorPersona enum.
  const [active, setActive] = useState('');
  const [cache, setCache] = useState<Record<string, AIReflectionView>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(
    async (persona: string) => {
      setLoading(true);
      setError('');
      try {
        const result = persona
          ? await api.ai.generatePersonaReflection(exhibitId, persona)
          : await api.ai.generateReflection(exhibitId);
        setCache((c) => ({ ...c, [persona]: result as AIReflectionView }));
      } catch {
        setError('The curator is silent. Try again later.');
      } finally {
        setLoading(false);
      }
    },
    [exhibitId],
  );

  // Auto-generate the default curator reflection on mount (prior behaviour).
  useEffect(() => {
    const timer = setTimeout(() => generate(''), 1800);
    return () => clearTimeout(timer);
  }, [exhibitId, generate]);

  const selectPersona = (persona: string) => {
    setActive(persona);
    setError('');
    if (!cache[persona]) generate(persona);
  };

  const reflection = cache[active];
  const activeMeta = CURATOR_PERSONAS.find((p) => p.value === active);

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-paper border border-glass-edge rounded-lg p-8 md:p-10 space-y-6"
    >
      <Eyebrow>{active ? `Through the ${activeMeta?.label}'s lens` : "Curator's reflection"}</Eyebrow>

      <div
        role="tablist"
        aria-label="Curator personas"
        className="flex flex-wrap gap-x-5 gap-y-2 border-b border-glass-edge pb-3"
      >
        {CURATOR_PERSONAS.map((p) => (
          <button
            key={p.value || 'curator'}
            role="tab"
            type="button"
            aria-selected={active === p.value}
            onClick={() => selectPersona(p.value)}
            className={cn(
              'relative font-mono text-[10px] uppercase tracking-[0.16em] py-1 transition-colors',
              active === p.value ? 'text-ink' : 'text-whisper hover:text-brass',
            )}
          >
            {p.label}
            {active === p.value && (
              <motion.span
                layoutId="persona-tab-underline"
                className="absolute -bottom-[13px] left-0 right-0 h-px bg-brass"
                transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.9 }}
              />
            )}
          </button>
        ))}
      </div>

      {loading && !reflection ? (
        <div className="flex items-center gap-3 py-2">
          <span className="brass-tick" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-whisper">
            {active ? `The ${activeMeta?.label} is reflecting…` : 'The curator is reflecting…'}
          </span>
        </div>
      ) : error && !reflection ? (
        <div>
          <p className="font-sans text-[14px] text-ink-muted">{error}</p>
          <button
            type="button"
            onClick={() => generate(active)}
            className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-brass hover:text-brass-deep transition-colors"
          >
            Try again
          </button>
        </div>
      ) : reflection ? (
        <div role="tabpanel" className="space-y-6">
          <blockquote className="font-display italic text-[clamp(1.25rem,1.6vw,1.5rem)] leading-relaxed text-ink">
            "{reflection.emotionalSummary}"
          </blockquote>

          {reflection.patterns?.length > 0 && (
            <div className="space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
                Patterns observed
              </span>
              <div className="flex flex-wrap gap-2">
                {reflection.patterns.map((pattern, i) => (
                  <Tag key={i} tone="muted">
                    {pattern}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {(reflection.reframing || reflection.observations) && <EngravedDivider />}

          {reflection.reframing && (
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
                Gentle reframing
              </span>
              <p className="font-sans text-[15px] leading-relaxed text-ink-muted max-w-[55ch]">
                {reflection.reframing}
              </p>
            </div>
          )}

          {reflection.observations && (
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
                Observations
              </span>
              <p className="font-sans text-[15px] leading-relaxed text-ink-muted max-w-[55ch]">
                {reflection.observations}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-glass-edge">
            <button
              type="button"
              onClick={() => generate(active)}
              disabled={loading}
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-whisper hover:text-brass transition-colors disabled:opacity-50"
            >
              {loading ? 'Reflecting…' : 'Request a new reflection'}
            </button>
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
