'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { EvolutionTreeView, EvolutionNodeView } from '@museum/shared';
import { api } from '@/lib/api';
import { Eyebrow } from '@/components/lamplit';
import { cn } from '@/lib/utils';

/**
 * Lamplit Archive — FailureEvolutionTree (Feature 4).
 *
 * Renders an exhibit's lineage (Attempt → Pivot → Recovery …) as an
 * interactive, collapsible vertical tree with recovery metrics. Fetched
 * lazily; renders nothing when the exhibit stands alone (≤ 1 attempt), so
 * isolated exhibits never show an empty tree.
 */

const STATUS_LABEL: Record<string, string> = {
  failed: 'Failed',
  ongoing: 'Ongoing',
  recovered: 'Recovered',
  successful: 'Successful',
};

export function FailureEvolutionTree({ exhibitId }: { exhibitId: string }) {
  const [data, setData] = useState<EvolutionTreeView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.exhibits
      .evolution(exhibitId)
      .then((d) => {
        if (active) setData(d as EvolutionTreeView);
      })
      .catch(() => {
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [exhibitId]);

  if (loading || !data || data.metrics.attempts <= 1) return null;

  const { tree, metrics, focusId } = data;

  return (
    <section className="bg-paper border border-glass-edge rounded-lg p-8 md:p-10 space-y-6">
      <Eyebrow>Evolution</Eyebrow>

      <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-whisper">
        <span>
          {metrics.attempts} {metrics.attempts === 1 ? 'attempt' : 'attempts'}
        </span>
        <span>
          {metrics.retries} {metrics.retries === 1 ? 'retry' : 'retries'}
        </span>
        {metrics.timeToRecoverDays != null && (
          <span className="text-brass">Recovered in {metrics.timeToRecoverDays}d</span>
        )}
      </div>

      <div className="pt-1">
        <TreeNode node={tree} focusId={focusId} depth={0} />
      </div>
    </section>
  );
}

function TreeNode({
  node,
  focusId,
  depth,
}: {
  node: EvolutionNodeView;
  focusId: string;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isFocus = node.id === focusId;

  return (
    <div className={depth > 0 ? 'ml-2 pl-5 border-l border-glass-edge' : ''}>
      <div className="flex items-start gap-2 py-1.5">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? 'Collapse' : 'Expand'}
            className="mt-1 text-whisper hover:text-brass transition-colors"
          >
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span aria-hidden className="mt-1 inline-block w-3.5 text-center text-whisper">·</span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusDot status={node.evolutionStatus} />
            <Link
              href={`/exhibits/${node.id}`}
              className={cn(
                'font-display text-[1.0625rem] leading-snug transition-colors hover:text-brass',
                isFocus ? 'text-brass' : 'text-ink',
              )}
            >
              {node.title}
            </Link>
            {node.evolutionStatus && (
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-whisper">
                {STATUS_LABEL[node.evolutionStatus]}
              </span>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} focusId={focusId} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusDot({ status }: { status: string | null }) {
  const color =
    status === 'recovered' || status === 'successful'
      ? 'bg-brass'
      : status === 'ongoing'
        ? 'bg-whisper'
        : 'bg-ink-muted';
  return <span aria-hidden className={cn('inline-block w-2 h-2 rounded-full shrink-0', color)} />;
}
