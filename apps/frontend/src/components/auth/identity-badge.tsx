'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore, type IdentityMode } from '@/stores/auth-store';
import { api } from '@/lib/api';

/**
 * Lamplit Archive — IdentityBadge.
 *
 * A small mono-caps badge that exposes the current visibility mode and
 * lets the visitor switch between Anonymous / Pseudonym / Real Name.
 * Lives inside the top navigation. Popover is paper-tinted with a
 * hairline glass-edge border.
 */

const MODE_LABELS: Record<IdentityMode, string> = {
  anonymous: 'Anonymous',
  pseudonym: 'Pseudonym',
  real_name: 'Real Name',
};

const SPRING = { type: 'spring' as const, stiffness: 110, damping: 22, mass: 0.9 };

export function IdentityBadge() {
  const router = useRouter();
  const { userId, identityMode, displayName, isAnonymous, setIdentityMode, clear } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!userId) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-whisper">
        offline
      </span>
    );
  }

  const updateMode = async (mode: IdentityMode) => {
    setBusy(true);
    try {
      await api.auth.updateIdentityMode(userId, mode);
    } catch {
      // best-effort: keep local state consistent
    }
    setIdentityMode(mode);
    setBusy(false);
    setOpen(false);
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await api.auth.logout();
    } catch {
      /* ignore */
    }
    clear();
    setBusy(false);
    setOpen(false);
    toast('You stepped out of the archive. The exhibits remain.');
    router.push('/');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass transition-colors"
        title="Identity menu"
      >
        <span className="text-brass">●</span>
        <span className="hidden sm:inline">
          {displayName || MODE_LABELS[identityMode]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING}
            className="absolute right-0 top-full mt-2 w-60 bg-paper border border-glass-edge rounded-md p-2 shadow-[0_10px_30px_rgba(23,21,20,0.08)] z-50"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-whisper px-2 pt-1 pb-2">
              Visibility
            </p>
            {(Object.keys(MODE_LABELS) as IdentityMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => updateMode(mode)}
                disabled={busy}
                className={`w-full text-left px-2 py-1.5 text-[14px] rounded-sm transition-colors flex items-center gap-2 ${
                  identityMode === mode
                    ? 'bg-brass-soft text-brass'
                    : 'text-ink-muted hover:bg-vellum hover:text-ink'
                }`}
              >
                <span className={identityMode === mode ? 'text-brass' : 'text-whisper'}>●</span>
                {MODE_LABELS[mode]}
              </button>
            ))}

            <div className="my-2 h-px bg-glass-edge" />

            {isAnonymous ? (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="block w-full text-left px-2 py-1.5 text-[14px] rounded-sm text-ink hover:bg-vellum hover:text-brass transition-colors"
              >
                Sign in or register →
              </Link>
            ) : (
              <button
                onClick={signOut}
                disabled={busy}
                className="w-full text-left px-2 py-1.5 text-[14px] rounded-sm text-ink-muted hover:bg-vellum hover:text-ink transition-colors"
              >
                Sign out
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
