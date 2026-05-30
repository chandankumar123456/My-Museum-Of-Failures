'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { ExhibitView, ExhibitListView } from '@museum/shared';
import { api } from '@/lib/api';
import { CATEGORIES, ENDING_STATUSES } from '@/lib/constants';
import { MuseumNavigation } from '@/components/museum/navigation';
import {
  Eyebrow,
  EngravedDivider,
  ExhibitCard,
  EmptyComposed,
  Tag,
} from '@/components/lamplit';
import { useRoomTint } from '@/components/lamplit-3d';
import { stagger } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Lamplit Archive — Archive page (/exhibits).
 *
 * Editorial mixed grid of `<ExhibitCard>` instances with a slim filter
 * bar (search + category + ending status). Skeletons match card height
 * to avoid CLS. Empty state is a composed scene, not "No data found".
 */
export default function ExhibitsPage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

  const [exhibits, setExhibits] = useState<ExhibitView[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [endingStatus, setEndingStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce free-text search; category/ending stay instant.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (endingStatus) params.set('endingStatus', endingStatus);
    if (debouncedSearch) params.set('search', debouncedSearch);
    params.set('limit', '60');

    api.exhibits
      .list(params.toString())
      .then((data) => {
        if (active) setExhibits(((data as ExhibitListView).exhibits ?? []) as ExhibitView[]);
      })
      .catch(() => {
        if (active) setExhibits([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Ignore this request's result if the filters change before it resolves,
    // so a slow earlier response can never overwrite the current selection.
    return () => {
      active = false;
    };
  }, [category, endingStatus, debouncedSearch]);

  const total = exhibits.length;

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <ArchiveHeader total={total} />
          <FilterBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            endingStatus={endingStatus}
            setEndingStatus={setEndingStatus}
          />

          <EngravedDivider label="// THE COLLECTION" />

          <section className="mt-12">
            {loading ? (
              <ArchiveSkeleton />
            ) : exhibits.length === 0 ? (
              <EmptyComposed
                title="The archive is quiet."
                caption="Nothing matches that lens. Loosen a filter or step back to the full collection."
              />
            ) : (
              <ArchiveGrid exhibits={exhibits} />
            )}
          </section>
        </div>
      </main>
    </>
  );
}

// ---- Header --------------------------------------------------------------

function ArchiveHeader({ total }: { total: number }) {
  return (
    <header className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
      <div className="md:col-span-7">
        <Eyebrow>The Archive · 002</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
          Preserved failures.
        </h1>
        <p className="mt-6 font-display text-[clamp(1.125rem,1.4vw,1.375rem)] italic leading-relaxed text-ink-muted max-w-[55ch]">
          Each one is a story someone chose not to hide. Browse by category,
          by how it ended, or by the pull of a single phrase.
        </p>
      </div>
      <aside className="md:col-span-4 md:col-start-9 self-end">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper space-y-2">
          <div className="flex justify-between">
            <span>Total preservations</span>
            <span className="text-ink">{total}</span>
          </div>
          <div className="flex justify-between">
            <span>Updated</span>
            <span className="text-ink">today</span>
          </div>
          <div className="flex justify-between">
            <span>Sort</span>
            <span className="text-ink">most recent</span>
          </div>
        </div>
      </aside>
    </header>
  );
}

// ---- Filters -------------------------------------------------------------

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  endingStatus: string;
  setEndingStatus: (v: string) => void;
}

function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  endingStatus,
  setEndingStatus,
}: FilterBarProps) {
  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = [];
    if (category) {
      const c = CATEGORIES.find((x) => x.value === category);
      chips.push({ label: c?.label ?? category, clear: () => setCategory('') });
    }
    if (endingStatus) {
      const s = ENDING_STATUSES.find((x) => x.value === endingStatus);
      chips.push({ label: s?.label ?? endingStatus, clear: () => setEndingStatus('') });
    }
    if (search) chips.push({ label: `"${search}"`, clear: () => setSearch('') });
    return chips;
  }, [category, endingStatus, search, setCategory, setEndingStatus, setSearch]);

  return (
    <section className="mb-16 pb-8 border-b border-glass-edge">
      <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <label
            htmlFor="archive-search"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-whisper"
          >
            Search
          </label>
          <div className="relative mt-2">
            <Search aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 text-whisper w-4 h-4" />
            <input
              id="archive-search"
              name="search"
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="A phrase from a confession…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="archival-input pl-7 text-[15px]"
            />
          </div>
        </div>

        {/* Category */}
        <SelectField
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: '', label: 'All categories' },
            ...CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
          ]}
        />

        {/* Ending status */}
        <SelectField
          label="Ending"
          value={endingStatus}
          onChange={setEndingStatus}
          options={[
            { value: '', label: 'All endings' },
            ...ENDING_STATUSES.map((s) => ({ value: s.value, label: s.label })),
          ]}
        />
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-whisper mr-2">
            Active
          </span>
          {activeChips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.clear}
              className="group"
              aria-label={`Clear ${chip.label}`}
            >
              <Tag tone="brass" interactive>
                {chip.label} <span className="ml-1 text-brass-deep">×</span>
              </Tag>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

interface Option {
  value: string;
  label: string;
}

/**
 * Lamplit-native dropdown. Replaces the raw <select> whose OS-rendered
 * option popup clashed with the warm archive palette. Trigger reuses the
 * archival underline input; the panel is warm paper with a brass tick on
 * the active row. Closes on outside-click or Escape.
 */
function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="md:w-56" ref={ref} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
      <label className="font-mono text-[10px] uppercase tracking-[0.16em] text-whisper">
        {label}
      </label>
      <div className="relative mt-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="archival-input flex items-center justify-between gap-2 text-left text-[15px] hover:border-brass/50"
        >
          <span className={value ? 'text-ink' : 'text-whisper'}>{selected?.label}</span>
          <span
            aria-hidden
            className={cn(
              'text-xs transition-transform duration-200',
              open ? 'rotate-180 text-brass' : 'text-whisper',
            )}
          >
            ▾
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="absolute z-30 mt-2 w-full max-h-64 overflow-auto rounded-md border border-glass-edge bg-paper py-1 shadow-[0_14px_36px_-18px_rgba(23,21,20,0.5)]"
            >
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <li key={opt.value || 'all'} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center px-4 py-2 text-left text-[14px] transition-colors',
                        active ? 'text-brass' : 'text-ink-muted hover:bg-vellum/50 hover:text-ink',
                      )}
                    >
                      <span className={cn('brass-tick transition-opacity', active ? 'opacity-100' : 'opacity-0')} />
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- Grid + Skeleton -----------------------------------------------------

/**
 * Editorial mixed grid: 12 columns, with row patterns alternating
 *   8 / 4   →   one wide card + one narrow
 *   4 / 8   →   one narrow + one wide
 * Every 4th card is a wide single (12 cols) for a curated breath.
 * Cards inherit the lamplit `<ExhibitCard>` Plaque + Artifact look.
 */
function ArchiveGrid({ exhibits }: { exhibits: ExhibitView[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-12 gap-6"
    >
      {exhibits.map((exhibit, i) => {
        const span = spanFor(i);
        return (
          <ExhibitCard
            key={exhibit.id}
            exhibit={exhibit}
            index={i}
            className={span}
          />
        );
      })}
    </motion.div>
  );
}

function spanFor(i: number) {
  const r = i % 5;
  if (r === 0) return 'md:col-span-8';
  if (r === 1) return 'md:col-span-4';
  if (r === 2) return 'md:col-span-4';
  if (r === 3) return 'md:col-span-8';
  return 'md:col-span-12';
}

function ArchiveSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`${spanFor(i)} bg-paper border border-glass-edge rounded-lg p-8 min-h-[280px] animate-pulse flex flex-col gap-3`}
        >
          <div className="h-3 w-24 bg-vellum rounded-sm" />
          <div className="h-3 w-32 bg-vellum rounded-sm" />
          <div className="h-7 w-3/4 bg-vellum rounded-sm mt-3" />
          <div className="h-3 w-full bg-vellum rounded-sm" />
          <div className="h-3 w-5/6 bg-vellum rounded-sm" />
          <div className="mt-auto h-3 w-1/3 bg-vellum rounded-sm" />
        </div>
      ))}
    </div>
  );
}
