'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { ExhibitForm } from '@/components/exhibits/exhibit-form';
import type { ExhibitView } from '@museum/shared';

export default function CreateExhibitPage() {
  const router = useRouter();

  const handleSuccess = (exhibit: unknown) => {
    const created = exhibit as Partial<ExhibitView> | null;
    toast.success('Exhibit preserved. The archive grows quieter, and a little fuller.');
    if (created?.id) {
      router.push(`/exhibits/${created.id}`);
    } else {
      router.push('/exhibits');
    }
  };

  return (
    <MuseumLayout>
      <ExhibitForm onSuccess={handleSuccess} />
    </MuseumLayout>
  );
}
