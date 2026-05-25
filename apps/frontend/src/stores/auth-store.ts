import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type IdentityMode = 'anonymous' | 'pseudonym' | 'real_name';

interface AuthState {
  userId: string | null;
  identityMode: IdentityMode;
  displayName: string | null;
  isAnonymous: boolean;
  setUser: (user: {
    userId: string;
    identityMode?: IdentityMode;
    displayName?: string | null;
    isAnonymous?: boolean;
  }) => void;
  setIdentityMode: (mode: IdentityMode) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      identityMode: 'anonymous',
      displayName: null,
      isAnonymous: true,
      setUser: (user) =>
        set({
          userId: user.userId,
          identityMode: user.identityMode ?? 'anonymous',
          displayName: user.displayName ?? null,
          isAnonymous: user.isAnonymous ?? false,
        }),
      setIdentityMode: (mode) => set({ identityMode: mode }),
      clear: () =>
        set({
          userId: null,
          identityMode: 'anonymous',
          displayName: null,
          isAnonymous: true,
        }),
    }),
    {
      name: 'museum-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
