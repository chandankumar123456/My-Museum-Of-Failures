import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  sessionId: string | null;
  identityMode: 'anonymous' | 'pseudonym' | 'real_name' | null;
  displayName: string | null;
  setUser: (user: { userId: string; sessionId?: string; identityMode?: string; displayName?: string }) => void;
  setIdentityMode: (mode: 'anonymous' | 'pseudonym' | 'real_name') => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  sessionId: null,
  identityMode: null,
  displayName: null,
  setUser: (user) =>
    set({
      userId: user.userId,
      sessionId: user.sessionId || null,
      identityMode: (user.identityMode as any) || 'anonymous',
      displayName: user.displayName || null,
    }),
  setIdentityMode: (mode) => set({ identityMode: mode }),
  clear: () =>
    set({
      userId: null,
      sessionId: null,
      identityMode: null,
      displayName: null,
    }),
}));
