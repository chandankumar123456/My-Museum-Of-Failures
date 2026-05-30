'use client';

import { useEffect, useState } from 'react';
import type { FailureGenomeView, GenomeComparisonView } from '@museum/shared';
import { PRACTICAL_TRAITS, EMOTIONAL_TRAITS } from '@museum/shared';
import { api } from '@/lib/api';
import { Eyebrow } from '@/components/lamplit';
import { cn } from '@/lib/utils';

/**
 * Lamplit Archive — FailureGenome (Feature 3).
 *
 * A failure's practical + emotional DNA. Practical traits render as an SVG
 * radar, emotional traits as bars. A "Compare" control (related exhibits)
 * overlays a second genome and shows an overall similarity score. Generated
 * once per exhibit and cached server-side; fetched lazily.
 */

export function FailureGenome({ exhibitId }: { exhibitId: string }) {
  const [genome, setGenome] = useState<FailureGenomeView | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<{ id: string; title: string }[]>([]);
  const [comparison, setComparison] = useState<GenomeComparisonView | null>(null);
  const [compareId, setCompareId] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setComparison(null);
    setCompareId('');
    api.genome
      .generate(exhibitId)
      .then((g) => {
        if (active) setGenome(g as FailureGenomeView);
      })
      .catch(() => {
        if (active) setGenome(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    api.exhibits
      .similar(exhibitId)
      .then((rows) => {
        if (active) {
          setRelated(
            (rows as { id: string; title: string }[])
              .slice(0, 5)
              .map((r) => ({ id: r.id, title: r.title })),
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [exhibitId]);

  const compareWith = async (id: string) => {
    setCompareId(id);
    if (!id) {
      setComparison(null);
      return;
    }
    try {
      const c = await api.genome.compare(exhibitId, id);
      setComparison(c as GenomeComparisonView);
    } catch {
      setComparison(null);
    }
  };

  if (loading || !genome) return null;

  const b = comparison?.b ?? null;
  const practicalA = PRACTICAL_TRAITS.map((t) => genome.practical[t] ?? 50);
  const practicalB = b ? PRACTICAL_TRAITS.map((t) => b.practical[t] ?? 50) : null;

  return (
    <section className="bg-paper border border-glass-edge rounded-lg p-8 md:p-10 space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Eyebrow>Failure genome</Eyebrow>
          {comparison && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
              {comparison.similarity.overall}% alike
            </p>
          )}
        </div>
        {related.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-whisper">
              Compare
            </span>
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                title={r.title}
                onClick={() => compareWith(compareId === r.id ? '' : r.id)}
                className={cn(
                  'font-mono text-[9px] uppercase tracking-[0.14em] px-2 py-1 border rounded-sm transition-colors max-w-[140px] truncate',
                  compareId === r.id
                    ? 'border-brass text-brass'
                    : 'border-glass-edge text-ink-muted hover:text-brass hover:border-brass/40',
                )}
              >
                {r.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <Radar
          axes={PRACTICAL_TRAITS}
          series={[
            { values: practicalA, stroke: 'var(--color-brass)', fill: 'rgba(168,121,75,0.14)' },
            ...(practicalB
              ? [{ values: practicalB, stroke: 'var(--color-ink-muted)', fill: 'rgba(92,83,74,0.10)' }]
              : []),
          ]}
        />
        <div className="space-y-3">
          {EMOTIONAL_TRAITS.map((t) => (
            <TraitBar
              key={t}
              label={t}
              a={genome.emotional[t] ?? 50}
              b={b ? (b.emotional[t] ?? 50) : null}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Radar({
  axes,
  series,
}: {
  axes: readonly string[];
  series: { values: number[]; stroke: string; fill: string }[];
}) {
  const c = 130;
  const R = c - 36;
  const n = axes.length;
  const pt = (i: number, r: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [c + Math.cos(ang) * r, c + Math.sin(ang) * r] as const;
  };
  const poly = (vals: number[]) =>
    vals
      .map((v, i) => {
        const [x, y] = pt(i, (Math.max(0, Math.min(100, v)) / 100) * R);
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <svg
      viewBox="-50 -10 360 280"
      className="w-full max-w-[320px] mx-auto"
      role="img"
      aria-label="Practical trait radar"
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={axes.map((_, i) => pt(i, R * f).join(',')).join(' ')}
          fill="none"
          stroke="var(--color-glass-edge)"
          strokeWidth="1"
        />
      ))}
      {axes.map((label, i) => {
        const [x, y] = pt(i, R);
        const [lx, ly] = pt(i, R + 16);
        return (
          <g key={label}>
            <line x1={c} y1={c} x2={x} y2={y} stroke="var(--color-glass-edge)" strokeWidth="1" />
            <text
              x={lx}
              y={ly}
              textAnchor={Math.abs(lx - c) < 6 ? 'middle' : lx > c ? 'start' : 'end'}
              dominantBaseline="middle"
              fill="#6E655A"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 7, letterSpacing: '0.5px' }}
            >
              {label.toUpperCase()}
            </text>
          </g>
        );
      })}
      {series.map((s, i) => (
        <polygon key={i} points={poly(s.values)} fill={s.fill} stroke={s.stroke} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function TraitBar({ label, a, b }: { label: string; a: number; b: number | null }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-whisper">
        <span>{label}</span>
        <span className="text-ink">
          {a}
          {b != null && <span className="text-ink-muted"> / {b}</span>}
        </span>
      </div>
      <div className="relative h-1 bg-vellum rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-brass" style={{ width: `${a}%` }} />
      </div>
      {b != null && (
        <div className="relative h-1 bg-vellum rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-ink-muted" style={{ width: `${b}%` }} />
        </div>
      )}
    </div>
  );
}
