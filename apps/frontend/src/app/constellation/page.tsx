'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { ConstellationGraphView, ConstellationNodeView, FailureRelationType } from '@museum/shared';
import { api } from '@/lib/api';
import { getCategoryLabel } from '@/lib/utils';
import { MuseumNavigation } from '@/components/museum/navigation';
import { Eyebrow, Button, EmptyComposed, Parallax } from '@/components/lamplit';
import { useRoomTint } from '@/components/lamplit-3d';
import { fadeUp } from '@/lib/motion';

/* ---- Category → muted tint color mapping (per-room tokens) ------------- */
const CATEGORY_COLORS: Record<string, string> = {
  startup_failure: 'var(--color-rust)',
  academic_collapse: 'var(--color-dusk)',
  relationship_failure: 'var(--color-bruise)',
  burnout: 'var(--color-amber)',
  career_regret: 'var(--color-ash)',
  missed_opportunity: 'var(--color-sage)',
  financial_mistake: 'var(--color-clay)',
  family_conflict: 'var(--color-pearl)',
  creative_failure: 'var(--color-clay)',
  identity_crisis: 'var(--color-bruise)',
  mental_exhaustion: 'var(--color-dusk)',
  failed_side_project: 'var(--color-sage)',
  interview_rejection: 'var(--color-ash)',
  betrayal: 'var(--color-rust)',
  unrealized_dream: 'var(--color-amber)',
};

const RELATION_LABELS: Record<string, string> = {
  similar_emotion: 'Emotion',
  similar_lesson: 'Lesson',
  similar_category: 'Category',
  similar_cause: 'Cause',
  same_user_journey: 'Journey',
};

const ALL_RELATION_TYPES: FailureRelationType[] = [
  'similar_emotion',
  'similar_lesson',
  'similar_category',
  'similar_cause',
  'same_user_journey',
];

/* ---- Layout: force-directed-ish radial placement (memoized) ------------- */
interface PositionedNode extends ConstellationNodeView {
  x: number;
  y: number;
}

function layoutNodes(nodes: ConstellationNodeView[]): PositionedNode[] {
  const groups = new Map<string, ConstellationNodeView[]>();
  for (const n of nodes) {
    const arr = groups.get(n.category) ?? [];
    arr.push(n);
    groups.set(n.category, arr);
  }
  const keys = Array.from(groups.keys());
  const total = Math.max(keys.length, 1);
  const result: PositionedNode[] = [];

  keys.forEach((key, gi) => {
    const center = ((gi + 0.5) / total) * Math.PI * 2 - Math.PI / 2;
    const wedge = ((Math.PI * 2) / total) * 0.7;
    const list = groups.get(key) ?? [];
    list.forEach((node, ei) => {
      const t = list.length > 1 ? ei / (list.length - 1) : 0.5;
      const angle = center + (t - 0.5) * wedge;
      const radius = 60 + (node.painLevel / 10) * 160 + ((ei % 3) - 1) * 8;
      result.push({ ...node, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    });
  });
  return result;
}

/* ---- Main page ---------------------------------------------------------- */
export default function ConstellationPage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => { setRoomTint('brass'); }, [setRoomTint]);

  const [data, setData] = useState<ConstellationGraphView | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);

  const fetchGraph = useCallback(() => {
    setLoading(true);
    (api.constellation.graph() as Promise<ConstellationGraphView>)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  const handleRebuild = () => {
    setRebuilding(true);
    (api.constellation.rebuild() as Promise<unknown>)
      .then(() => fetchGraph())
      .catch(() => {})
      .finally(() => setRebuilding(false));
  };

  return (
    <>
      <MuseumNavigation />
      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <Header total={data?.nodes.length ?? 0} onRebuild={handleRebuild} rebuilding={rebuilding} />
          <motion.section variants={fadeUp} initial="hidden" animate="visible" className="relative mt-16 w-full aspect-[4/3] md:aspect-[16/9] bg-paper border border-glass-edge overflow-hidden rounded-lg flex items-center justify-center">
            {loading ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper">Aligning star coordinates…</span>
            ) : !data || data.nodes.length === 0 ? (
              <EmptyComposed
                title="The sky is empty."
                caption="Be the first to add a star to this universe."
                action={<Link href="/exhibits/create"><Button variant="primary" size="md">Preserve a failure</Button></Link>}
              />
            ) : (
              <ConstellationGraph data={data} />
            )}
          </motion.section>
        </div>
      </main>
    </>
  );
}

/* ---- Header ------------------------------------------------------------- */
function Header({ total, onRebuild, rebuilding }: { total: number; onRebuild: () => void; rebuilding: boolean }) {
  return (
    <header className="grid grid-cols-1 md:grid-cols-12 gap-12">
      <Parallax offset={24} className="md:col-span-7">
        <Eyebrow>The Constellation · 010</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
          A map of the archive.
        </h1>
        <p className="mt-6 font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted max-w-[55ch]">
          Each star is a preserved exhibit. Distance from the centre reflects pain. Clusters map to categories. Click any star to explore its connections.
        </p>
      </Parallax>
      <aside className="md:col-span-4 md:col-start-9 self-end space-y-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper space-y-2">
          <Row label="Stars charted" value={String(total)} />
          <Row label="Distance" value="pain index" />
          <Row label="Size" value="impact score" />
          <Row label="Edges" value="connections" />
        </div>
        <button
          onClick={onRebuild}
          disabled={rebuilding}
          className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] px-4 py-2 border border-glass-edge rounded hover:bg-paper-dark transition-colors disabled:opacity-50"
        >
          {rebuilding ? 'Rebuilding…' : 'Rebuild graph'}
        </button>
      </aside>
    </header>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span>{label}</span><span className="text-ink">{value}</span></div>;
}

/* ---- Interactive Graph -------------------------------------------------- */
function ConstellationGraph({ data }: { data: ConstellationGraphView }) {
  const positioned = useMemo(() => layoutNodes(data.nodes), [data.nodes]);

  // View state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const ctrlHeld = useRef(false);

  // Interaction state
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<FailureRelationType>>(new Set(ALL_RELATION_TYPES));

  // Keyboard tracking for ctrl (rotate mode)
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Control') ctrlHeld.current = true; };
    const up = (e: KeyboardEvent) => { if (e.key === 'Control') ctrlHeld.current = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(4, z - e.deltaY * 0.001)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { setDragging(true); lastMouse.current = { x: e.clientX, y: e.clientY }; }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    if (ctrlHeld.current) {
      setRotation((r) => r + dx * 0.5);
    } else {
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  }, [dragging]);

  const handleMouseUp = useCallback(() => { setDragging(false); }, []);

  // Filtered edges
  const filteredEdges = useMemo(
    () => data.edges.filter((e) => activeFilters.has(e.type)),
    [data.edges, activeFilters],
  );

  // Focus helpers
  const focusedNode = useMemo(() => positioned.find((n) => n.id === focusedId) ?? null, [positioned, focusedId]);
  const neighborIds = useMemo(() => {
    if (!focusedId) return new Set<string>();
    const ids = new Set<string>();
    for (const e of filteredEdges) {
      if (e.source === focusedId) ids.add(e.target);
      if (e.target === focusedId) ids.add(e.source);
    }
    return ids;
  }, [focusedId, filteredEdges]);

  const relatedNodes = useMemo(
    () => positioned.filter((n) => neighborIds.has(n.id)),
    [positioned, neighborIds],
  );

  // Search highlight
  const searchLower = search.toLowerCase();
  const matchedIds = useMemo(() => {
    if (!searchLower) return null;
    return new Set(positioned.filter((n) => n.title.toLowerCase().includes(searchLower)).map((n) => n.id));
  }, [positioned, searchLower]);

  const toggleFilter = (type: FailureRelationType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  return (
    <div className="relative w-full h-full flex">
      {/* Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Search stars…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="font-mono text-[11px] px-3 py-1.5 bg-paper border border-glass-edge rounded w-44 focus:outline-none focus:border-brass"
        />
        <div className="flex gap-1 flex-wrap max-w-52">
          {ALL_RELATION_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => toggleFilter(t)}
              className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${
                activeFilters.has(t) ? 'bg-ink text-bone border-ink' : 'bg-paper text-whisper border-glass-edge'
              }`}
            >
              {RELATION_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom buttons */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
        <button onClick={() => setZoom((z) => Math.min(4, z + 0.3))} className="w-7 h-7 bg-paper border border-glass-edge rounded text-ink font-mono text-sm hover:bg-paper-dark">+</button>
        <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.3))} className="w-7 h-7 bg-paper border border-glass-edge rounded text-ink font-mono text-sm hover:bg-paper-dark">−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setRotation(0); }} className="w-7 h-7 bg-paper border border-glass-edge rounded text-ink font-mono text-[9px] hover:bg-paper-dark">⟲</button>
      </div>

      {/* SVG canvas */}
      <svg
        viewBox="-340 -240 680 480"
        className="w-full h-full select-none cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="img"
        aria-label="Failure constellation knowledge graph"
      >
        <g transform={`translate(${pan.x / 2}, ${pan.y / 2}) scale(${zoom}) rotate(${rotation})`}>
          {/* Radial guides */}
          {[70, 140, 220].map((r) => (
            <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#171514" strokeOpacity="0.06" strokeDasharray="3 3" strokeWidth="0.5" />
          ))}

          {/* Center glow */}
          <circle cx="0" cy="0" r="50" fill="url(#cGlow)" />
          <circle cx="0" cy="0" r="3.5" fill="#A8794B" />

          {/* Edges */}
          {filteredEdges.map((edge, i) => {
            const src = positioned.find((n) => n.id === edge.source);
            const tgt = positioned.find((n) => n.id === edge.target);
            if (!src || !tgt) return null;
            const isFocusEdge = focusedId && (edge.source === focusedId || edge.target === focusedId);
            return (
              <line
                key={i}
                x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                stroke={isFocusEdge ? '#A8794B' : '#171514'}
                strokeOpacity={isFocusEdge ? 0.7 : 0.08}
                strokeWidth={Math.max(0.5, edge.strength * (isFocusEdge ? 3 : 1.5))}
              />
            );
          })}

          {/* Nodes */}
          {positioned.map((node) => {
            const isFocused = node.id === focusedId;
            const isNeighbor = neighborIds.has(node.id);
            const isSearchMatch = matchedIds ? matchedIds.has(node.id) : false;
            const dimmed = (focusedId && !isFocused && !isNeighbor) || (matchedIds && !isSearchMatch);
            const radius = 2.5 + (node.impactScore / 100) * 5;
            const color = CATEGORY_COLORS[node.category] ?? 'var(--color-ash)';
            return (
              <circle
                key={node.id}
                cx={node.x} cy={node.y}
                r={isFocused ? radius + 2 : radius}
                fill={isFocused ? '#A8794B' : color}
                fillOpacity={dimmed ? 0.15 : isFocused ? 1 : 0.8}
                stroke={isSearchMatch ? '#A8794B' : 'none'}
                strokeWidth={isSearchMatch ? 1.5 : 0}
                className="cursor-pointer transition-all duration-200"
                onClick={() => setFocusedId(isFocused ? null : node.id)}
              />
            );
          })}
        </g>
        <defs>
          <radialGradient id="cGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A8794B" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#A8794B" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Focus panel */}
      <AnimatePresence>
        {focusedNode && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-3 bottom-3 z-20 w-64 bg-paper border border-glass-edge rounded-lg p-4 shadow-lg"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-brass block mb-1">
              {getCategoryLabel(focusedNode.category)}
            </span>
            <h3 className="font-display text-[15px] text-ink leading-snug">{focusedNode.title}</h3>
            <div className="mt-2 font-mono text-[10px] text-whisper space-y-0.5">
              <p>Pain: {focusedNode.painLevel}/10 · Impact: {focusedNode.impactScore}</p>
            </div>
            <Link href={`/exhibits/${focusedNode.id}`} className="mt-3 inline-block font-mono text-[10px] uppercase tracking-wider text-brass hover:underline">
              View exhibit →
            </Link>
            {relatedNodes.length > 0 && (
              <div className="mt-3 border-t border-glass-edge pt-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-whisper">Connected ({relatedNodes.length})</span>
                <ul className="mt-1 space-y-1 max-h-28 overflow-y-auto">
                  {relatedNodes.slice(0, 8).map((rn) => (
                    <li key={rn.id} className="font-sans text-[11px] text-ink-muted truncate cursor-pointer hover:text-ink" onClick={() => setFocusedId(rn.id)}>
                      {rn.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => setFocusedId(null)} className="absolute top-2 right-2 text-whisper hover:text-ink text-sm">×</button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
