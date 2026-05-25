'use client';

import { useAuthStore, type IdentityMode } from '@/stores/auth-store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { userId, identityMode, displayName, setIdentityMode } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!userId) {
    return (
      <span className="text-xs text-museum-700 font-mono uppercase tracking-wider">
        offline
      </span>
    );
  }

  const update = async (mode: IdentityMode) => {
    setSaving(true);
    try {
      await api.auth.updateIdentityMode(userId, mode);
      setIdentityMode(mode);
    } catch {
      // silent — keep local state in sync optimistically
      setIdentityMode(mode);
    } finally {
      setSaving(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-whisper-dark hover:text-whisper transition-colors"
        title="Change visibility mode"
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
            className="absolute right-0 top-full mt-2 w-52 museum-card p-2 shadow-lg shadow-void z-50"
          >
            <p className="text-[10px] uppercase tracking-wider text-museum-600 px-2 pt-1 pb-2">
              Visibility
            </p>
            {(Object.keys(MODE_LABELS) as IdentityMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => update(mode)}
                disabled={saving}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
