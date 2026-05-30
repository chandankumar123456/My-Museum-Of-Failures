'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { ExhibitView } from '@museum/shared';
import { api } from '@/lib/api';
import { MuseumNavigation } from '@/components/museum/navigation';
import { ExhibitDetail } from '@/components/exhibits/exhibit-detail';
import { EmptyComposed } from '@/components/lamplit';
import { useRoomTint } from '@/components/lamplit-3d';

/**
 * Lamplit Archive — `/exhibits/[id]` wrapper.
 *
 * Loads the exhibit from the API and hands it to `<ExhibitDetail>`. Sets
 * the ambient tint to brass (no per-room scope on a generic detail
 * page — pages reached from inside a room can override via state).
 */
export default function ExhibitPage() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

  const [exhibit, setExhibit] = useState<ExhibitView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.exhibits
      .get(id)
      .then((data) => setExhibit(data as ExhibitView))
      .catch(() => setExhibit(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <MuseumNavigation />
      <main className="min-h-[100dvh] bg-bone text-ink">
        {loading ? (
          <ExhibitSkeleton />
        ) : !exhibit ? (
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-32">
            <EmptyComposed
              title="This exhibit has been lost to time."
              caption="The preservation may have been retired, or the link is no longer valid."
            />
          </div>
        ) : (
          <ExhibitDetail exhibit={exhibit} />
        )}
      </main>
    </>
  );
}

function ExhibitSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24 animate-pulse">
      <div className="h-3 w-48 bg-vellum rounded-sm mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-8 space-y-4">
          <div className="h-3 w-32 bg-vellum rounded-sm" />
          <div className="h-12 w-3/4 bg-vellum rounded-sm" />
          <div className="h-3 w-1/2 bg-vellum rounded-sm" />
        </div>
        <div className="md:col-span-4 space-y-2">
          <div className="h-3 w-full bg-vellum rounded-sm" />
          <div className="h-px w-full bg-vellum" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-16">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-3 w-24 bg-vellum rounded-sm" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-full bg-vellum rounded-sm" />
          ))}
        </div>
        <div className="lg:col-span-4 bg-paper border border-glass-edge rounded-lg p-8 space-y-4">
          <div className="h-3 w-24 bg-vellum rounded-sm" />
          <div className="h-3 w-full bg-vellum rounded-sm" />
          <div className="h-3 w-3/4 bg-vellum rounded-sm" />
          <div className="h-3 w-1/2 bg-vellum rounded-sm" />
        </div>
      </div>
    </div>
  );
}
