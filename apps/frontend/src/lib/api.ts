const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = {
  exhibits: {
    list: (params?: string) => fetch(`${API_BASE}/exhibits${params ? `?${params}` : ''}`).then(r => r.json()),
    get: (id: string) => fetch(`${API_BASE}/exhibits/${id}`).then(r => r.json()),
    create: (data: any) => fetch(`${API_BASE}/exhibits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/exhibits/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    delete: (id: string) => fetch(`${API_BASE}/exhibits/${id}`, { method: 'DELETE' }).then(r => r.json()),
    similar: (id: string) => fetch(`${API_BASE}/exhibits/${id}/similar`).then(r => r.json()),
    emotionalSearch: (q: string) => fetch(`${API_BASE}/exhibits/emotional-search?q=${encodeURIComponent(q)}`).then(r => r.json()),
    oneSentence: () => fetch(`${API_BASE}/exhibits/one-sentence`).then(r => r.json()),
    unread: () => fetch(`${API_BASE}/exhibits/unread`).then(r => r.json()),
  },
  emotions: {
    react: (exhibitId: string, reaction: string) => fetch(`${API_BASE}/emotions/${exhibitId}/react/${reaction}`, { method: 'POST' }).then(r => r.json()),
    getReactions: (exhibitId: string) => fetch(`${API_BASE}/emotions/${exhibitId}/reactions`).then(r => r.json()),
    notAlone: (exhibitId: string) => fetch(`${API_BASE}/emotions/${exhibitId}/not-alone`).then(r => r.json()),
  },
  rooms: {
    list: () => fetch(`${API_BASE}/rooms`).then(r => r.json()),
    get: (slug: string) => fetch(`${API_BASE}/rooms/${slug}`).then(r => r.json()),
    randomWalk: () => fetch(`${API_BASE}/rooms/random-walk`).then(r => r.json()),
    lastAttempts: () => fetch(`${API_BASE}/rooms/last-attempts`).then(r => r.json()),
  },
  artifacts: {
    upload: (exhibitId: string, type: string, file: File) => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE}/artifacts/upload/${exhibitId}/${type}`, { method: 'POST', body: form }).then(r => r.json());
    },
    getUrl: (id: string) => fetch(`${API_BASE}/artifacts/${id}/url`).then(r => r.json()),
    getByExhibit: (exhibitId: string) => fetch(`${API_BASE}/artifacts/exhibit/${exhibitId}`).then(r => r.json()),
  },
  ai: {
    generateReflection: (exhibitId: string) => fetch(`${API_BASE}/ai-reflection/generate/${exhibitId}`, { method: 'POST' }).then(r => r.json()),
    curatedExhibitions: () => fetch(`${API_BASE}/ai-reflection/curated-exhibitions`).then(r => r.json()),
    curatorChat: (message: string, context?: any) => fetch(`${API_BASE}/ai-reflection/curator`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, context }) }).then(r => r.json()),
  },
  timeCapsule: {
    create: (data: any) => fetch(`${API_BASE}/time-capsule`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    getUser: (userId: string) => fetch(`${API_BASE}/time-capsule/user/${userId}`).then(r => r.json()),
    get: (id: string, userId: string) => fetch(`${API_BASE}/time-capsule/${id}/${userId}`).then(r => r.json()),
    setLegacy: (userId: string, exhibitId: string) => fetch(`${API_BASE}/time-capsule/legacy/${userId}/${exhibitId}`, { method: 'POST' }).then(r => r.json()),
    getLegacy: (userId: string) => fetch(`${API_BASE}/time-capsule/legacy/${userId}`).then(r => r.json()),
  },
  auth: {
    anonymous: () => fetch(`${API_BASE}/auth/anonymous`, { method: 'POST' }).then(r => r.json()),
    register: (data: any) => fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    pseudonym: (pseudonym: string) => fetch(`${API_BASE}/auth/pseudonym`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pseudonym }) }).then(r => r.json()),
  },
};
