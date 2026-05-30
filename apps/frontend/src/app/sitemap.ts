import type { MetadataRoute } from 'next';
import { MUSEUM_ROOMS } from '@/lib/constants';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Revalidate hourly so new exhibits appear without a redeploy.
export const revalidate = 3600;

const ROUTES = [
  '',
  '/exhibits',
  '/exhibits/create',
  '/rooms',
  '/rooms/random-walk',
  '/rooms/last-attempts',
  '/curator',
  '/constellation',
  '/time-capsule',
  '/legacy',
  '/about',
];

async function fetchExhibitIds(): Promise<string[]> {
  try {
    const res = await fetch(`${apiBase}/exhibits?limit=1000`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { exhibits?: { id: string }[] };
    return (data.exhibits ?? []).map((e) => e.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const exhibitIds = await fetchExhibitIds();
  return [
    ...ROUTES.map((path) => ({ url: `${baseUrl}${path}`, lastModified })),
    ...MUSEUM_ROOMS.map((room) => ({ url: `${baseUrl}${room.path}`, lastModified })),
    ...exhibitIds.map((id) => ({ url: `${baseUrl}/exhibits/${id}`, lastModified })),
  ];
}
