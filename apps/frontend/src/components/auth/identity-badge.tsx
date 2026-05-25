'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore, type IdentityMode } from '@/stores/auth-store';
import { api } from '@/lib/api';

const MODE_LABELS: Record<IdentityMode, string> = {
  anonymous: 'Anonymous',
  pseudonym: 'Pseudonym',
  real_name: 'Real Name',
};

const MODE_COLORS: Record<IdentityMode, string> = {
  anonymous: 'text-museum-500',
  pseudonym: 'text-amber-400/80',
  real_name: 'text-ember',
};

export function IdentityBadge() {
  const router = useRouter();
  const { userId, identityMode, displayName, isAnonymous, setIdentityMode, clear } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!userId) {
    return (
      <span className="text-xs text-museum-700 font-mono uppercase tracking-wider">
        offline
      </span>
    );
  }

  const updateMode = async (mode: IdentityMode) => {
    setBusy(true);
    try {
      await api.auth.updateIdentityMode(userId, mode);
      setIdentityMode(mode);
    } catch {
      // Best-effort: keep local state in sync optimistically
      setIdentityMode(mode);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await api.auth.logout();
    } catch {
      /* ignore — clearing locally is what matters */
    }
    clear();
    setBusy(false);
    setOpen(false);
    toast('You stepped out of the museum. The exhibits remain.');
    router.push('/');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-whisper-dark hover:text-whisper transition-colors"
        title="Identity menu"
      >
        <span className={MODE_COLORS[identityMode]}>●</span>
        <span className="hidden sm:inline">
          {displayName ? displayName : MODE_LABELS[identityMode]}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 museum-card p-2 shadow-lg shadow-void z-50"
          >
            <p className="text-[10px] uppercase tracking-wider text-museum-600 px-2 pt-1 pb-2">
              Visibility
            </p>
            {(Object.keys(MODE_LABELS) as IdentityMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => updateMode(mode)}
                disabled={busy}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-sm transition-colors flex items-center gap-2 ${
                  identityMode === mode
                    ? 'bg-ember/10 text-ember'
                    : 'text-whisper-dark hover:bg-void hover:text-whisper'
                }`}
              >
                <span className={MODE_COLORS[mode]}>●</span>
                {MODE_LABELS[mode]}
              </button>
            ))}

            <div className="my-2 museum-divider" />

            {isAnonymous ? (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="block w-full text-left px-2 py-1.5 text-sm rounded-sm text-whisper hover:bg-void hover:text-ember transition-colors"
              >
                Sign in or register →
              </Link>
            ) : (
              <button
                onClick={signOut}
                disabled={busy}
                className="w-full text-left px-2 py-1.5 text-sm rounded-sm text-whisper-dark hover:bg-void hover:text-whisper transition-colors"
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
