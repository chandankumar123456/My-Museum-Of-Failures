'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';

/**
 * Ensures every visitor has a persistent anonymous userId so features
 * that require user context (time capsules, legacy vault, reaction
 * de-duplication) work without forcing sign-up.
 *
 * Two race conditions guarded against:
 *  1. zustand `persist` middleware hydrates from localStorage on the
 *     client; on Next.js the SSR pass shows `userId: null`. We wait
 *     for `hasHydrated()` before deciding whether to create a new
 *     anonymous user — otherwise a hard reload would briefly believe
 *     the visitor has no identity and call `/auth/anonymous` again,
 *     overwriting the stored one with a brand-new user.
 *  2. The bootstrap fetch itself is fired exactly once via a ref.
 *
 * If the backend is unreachable, this silently no-ops and the
 * IdentityBadge will render `offline` until next mount.
 */
export function AuthBootstrap() {
  const { userId, setUser } = useAuthStore();
  const [hydrated, setHydrated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return useAuthStore.persist?.hasHydrated() ?? true;
  });
  const attempted = useRef(false);

  useEffect(() => {
    if (hydrated) return;
    const persist = useAuthStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || userId || attempted.current) return;
    attempted.current = true;

    api.auth
      .anonymous()
      .then((res) => {
        setUser({
          userId: res.userId,
          identityMode: res.identityMode as 'anonymous' | 'pseudonym' | 'real_name',
          isAnonymous: res.isAnonymous,
        });
      })
      .catch(() => {
        // Backend may be offline during local dev; UI falls back to
        // 'offline' messaging until the next reload.
      });
  }, [hydrated, userId, setUser]);

  return null;
}
