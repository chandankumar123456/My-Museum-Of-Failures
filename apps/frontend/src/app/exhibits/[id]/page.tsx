'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { ExhibitView } from '@museum/shared';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { ExhibitDetail } from '@/components/exhibits/exhibit-detail';
import { ReactionButtons } from '@/components/emotions/reaction-buttons';
import { YouAreNotAlone } from '@/components/emotions/you-are-not-alone';
import { ReflectionPanel } from '@/components/ai/reflection-panel';
import { api } from '@/lib/api';

export default function ExhibitPage() {
  const params = useParams();
  const [exhibit, setExhibit] = useState<ExhibitView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    api.exhibits
      .get(params.id as string)
      .then((data) => setExhibit(data as ExhibitView))
      .catch(() => setExhibit(null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <MuseumLayout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-museum-800 rounded w-1/4" />
            <div className="h-10 bg-museum-800 rounded w-3/4" />
            <div className="h-4 bg-museum-800 rounded w-1/2" />
            <div className="grid grid-cols-2 gap-8 mt-8">
              <div className="h-48 bg-museum-800 rounded" />
              <div className="h-48 bg-museum-800 rounded" />
            </div>
          </div>
        </div>
      </MuseumLayout>
    );
  }

  if (!exhibit) {
    return (
      <MuseumLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="font-serif text-2xl text-museum-600">This exhibit has been lost to time.</p>
        </div>
      </MuseumLayout>
    );
  }

  return (
    <MuseumLayout>
      <ExhibitDetail exhibit={exhibit} />

      <div className="max-w-4xl mx-auto px-4 pb-12 space-y-6">
        <ReactionButtons exhibitId={exhibit.id} />

        <ReflectionPanel exhibitId={exhibit.id} />

        <YouAreNotAlone exhibitId={exhibit.id} />
      </div>
    </MuseumLayout>
  );
}
