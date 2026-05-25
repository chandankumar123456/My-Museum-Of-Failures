'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';

/**
 * Ensures every visitor has a persistent anonymous userId so features
 * that require user context (time capsules, legacy vault, reaction
 * de-duplication) work without forcing sign-up.
 *
 * Once the backend is unreachable or the userId already exists in
 * localStorage, this silently no-ops.
 */
export function AuthBootstrap() {
  const { userId, setUser } = useAuthStore();
  const attempted = useRef(false);

  useEffect(() => {
    if (userId || attempted.current) return;
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
        // The backend may be offline during local dev. The UI will fall back
        // to "sign-in required" messaging until it becomes available again.
      });
  }, [userId, setUser]);

  return null;
}
