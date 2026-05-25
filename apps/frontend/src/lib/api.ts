'use client';

/**
 * Thin, typed fetch wrapper around the NestJS backend.
 *
 * Notes:
 * - All methods throw on non-2xx so callers can handle failures with
 *   try/catch or with TanStack Query's error states.
 * - Anonymous reactions still work; userId is optional everywhere it is
 *   not strictly required (time capsules, legacy vault).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, text || `Request failed (${res.status})`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const json = (body: unknown) => ({
  method: 'POST' as const,
  body: JSON.stringify(body),
});

export const api = {
  exhibits: {
    list: (params?: string) => request<{ exhibits: unknown[]; total: number }>(
      `/exhibits${params ? `?${params}` : ''}`,
    ),
    get: (id: string) => request<unknown>(`/exhibits/${id}`),
    create: (data: unknown) => request<unknown>('/exhibits', json(data)),
    update: (id: string, data: unknown) => request<unknown>(`/exhibits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    remove: (id: string) => request<unknown>(`/exhibits/${id}`, { method: 'DELETE' }),
    similar: (id: string) => request<unknown[]>(`/exhibits/${id}/similar`),
    emotionalSearch: (q: string) => request<unknown[]>(
      `/exhibits/emotional-search?q=${encodeURIComponent(q)}`,
    ),
    oneSentence: () => request<unknown[]>('/exhibits/one-sentence'),
    unread: () => request<unknown[]>('/exhibits/unread'),
    incrementRetry: (id: string) => request<unknown>(`/exhibits/${id}/retry`, { method: 'POST' }),
  },
  emotions: {
    react: (exhibitId: string, reaction: string, userId?: string) => request<unknown>(
      `/emotions/${exhibitId}/react/${reaction}${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`,
      { method: 'POST' },
    ),
    getReactions: (exhibitId: string) => request<{
      total: number;
      counts: Record<string, number>;
      reactions: unknown[];
    }>(`/emotions/${exhibitId}/reactions`),
    notAlone: (exhibitId: string) => request<unknown[]>(`/emotions/${exhibitId}/not-alone`),
  },
  rooms: {
    list: () => request<unknown[]>('/rooms'),
    get: (slug: string) => request<unknown>(`/rooms/${slug}`),
    randomWalk: () => request<unknown[]>('/rooms/random-walk'),
    lastAttempts: () => request<unknown[]>('/rooms/last-attempts'),
  },
  artifacts: {
    upload: (exhibitId: string, type: string, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE}/artifacts/upload/${exhibitId}/${type}`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      }).then(async (r) => {
        if (!r.ok) throw new ApiError(r.status, 'Upload failed');
        return r.json();
      });
    },
    getUrl: (id: string) => request<{ url: string; artifact: unknown }>(`/artifacts/${id}/url`),
    getByExhibit: (exhibitId: string) => request<unknown[]>(`/artifacts/exhibit/${exhibitId}`),
  },
  ai: {
    generateReflection: (exhibitId: string) => request<{
      emotionalSummary: string;
      patterns: string[];
      reframing: string;
      observations: string;
    }>(`/ai-reflection/generate/${exhibitId}`, { method: 'POST' }),
    curatedExhibitions: () => request<unknown[]>('/ai-reflection/curated-exhibitions'),
    curatorChat: (message: string, context?: { recentExhibits?: string[] }) =>
      request<{ message: string; role: string }>('/ai-reflection/curator', json({ message, context })),
  },
  timeCapsule: {
    create: (data: { userId: string; title: string; message: string; unlockDate: string }) =>
      request<unknown>('/time-capsule', json(data)),
    getUser: (userId: string) => request<{ unlocked: unknown[]; locked: unknown[] }>(
      `/time-capsule/user/${userId}`,
    ),
    get: (id: string, userId: string) => request<unknown>(`/time-capsule/${id}/${userId}`),
    setLegacy: (userId: string, exhibitId: string) => request<unknown>(
      `/time-capsule/legacy/${userId}/${exhibitId}`,
      { method: 'POST' },
    ),
    getLegacy: (userId: string) => request<unknown>(`/time-capsule/legacy/${userId}`),
  },
  auth: {
    anonymous: () => request<{
      userId: string;
      identityMode: string;
      isAnonymous: boolean;
    }>('/auth/anonymous', { method: 'POST' }),
    register: (data: { email: string; password: string; displayName?: string }) =>
      request<{ user: { id: string; email?: string; displayName?: string; identityMode: string } }>(
        '/auth/register',
        json(data),
      ),
    login: (data: { email: string; password: string }) =>
      request<{ user: { id: string; email?: string; displayName?: string; identityMode: string } }>(
        '/auth/login',
        json(data),
      ),
    pseudonym: (pseudonym: string) =>
      request<{ user: { id: string; pseudonym?: string; displayName?: string; identityMode: string } }>(
        '/auth/pseudonym',
        json({ pseudonym }),
      ),
    logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
    getUser: (userId: string) => request<unknown>(`/auth/user/${userId}`),
    updateIdentityMode: (userId: string, mode: 'anonymous' | 'pseudonym' | 'real_name') =>
      request<unknown>(`/auth/identity-mode/${userId}`, json({ mode })),
  },
};

export { ApiError };
