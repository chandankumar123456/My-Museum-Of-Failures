'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ExhibitView } from '@museum/shared';
import { MuseumNavigation } from '@/components/museum/navigation';
import { ExhibitForm } from '@/components/exhibits/exhibit-form';
import { useRoomTint } from '@/components/lamplit-3d';

/**
 * Lamplit Archive — `/exhibits/create` route shell.
 *
 * Wraps the multi-step `<ExhibitForm>` with the lamplit nav + bone
 * canvas. Routes to the new exhibit's detail page on success.
 */
export default function CreateExhibitPage() {
  const router = useRouter();
  const { setRoomTint } = useRoomTint();

  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

  const handleSuccess = (exhibit: unknown) => {
    const created = exhibit as Partial<ExhibitView> | null;
    toast('Exhibit preserved. The archive grows quieter, and a little fuller.');
    if (created?.id) {
      router.push(`/exhibits/${created.id}`);
    } else {
      router.push('/exhibits');
    }
  };

  return (
    <>
      <MuseumNavigation />
      <main className="min-h-[100dvh] bg-bone text-ink">
        <ExhibitForm onSuccess={handleSuccess} />
      </main>
    </>
  );
}
