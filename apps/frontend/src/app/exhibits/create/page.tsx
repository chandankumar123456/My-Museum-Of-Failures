'use client';

import { MuseumLayout } from '@/components/museum/museum-layout';
import { ExhibitForm } from '@/components/exhibits/exhibit-form';

export default function CreateExhibitPage() {
  return (
    <MuseumLayout>
      <ExhibitForm onSuccess={() => { window.location.href = '/exhibits'; }} />
    </MuseumLayout>
  );
}
