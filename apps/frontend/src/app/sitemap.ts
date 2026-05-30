import type { MetadataRoute } from 'next';
import { MUSEUM_ROOMS } from '@/lib/constants';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    ...ROUTES.map((path) => ({ url: `${baseUrl}${path}`, lastModified })),
    ...MUSEUM_ROOMS.map((room) => ({ url: `${baseUrl}${room.path}`, lastModified })),
  ];
}
