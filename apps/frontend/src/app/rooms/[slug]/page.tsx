'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ExhibitView } from '@museum/shared';
import { api } from '@/lib/api';
import { MUSEUM_ROOMS } from '@/lib/constants';
import { MuseumNavigation } from '@/components/museum/navigation';
import {
  Eyebrow,
  EngravedDivider,
  ExhibitCard,
  EmptyComposed,
} from '@/components/lamplit';
import { useRoomTint, type RoomTintName } from '@/components/lamplit-3d';
import { stagger } from '@/lib/motion';

interface RoomDetailView {
  id: string;
  name: string;
  description: string;
  exhibits: ExhibitView[];
}

const ROOM_TINT_MAP: Record<string, RoomTintName> = {
  hall_of_broken_dreams: 'ash',
  startup_cemetery: 'clay',
  burnout_basement: 'rust',
  academic_ruins: 'sage',
  gallery_of_lost_potential: 'pearl',
  the_regret_archive: 'dusk',
  abandoned_futures_wing: 'amber',
  relationship_graveyard: 'bruise',
};

/**
 * Lamplit Archive — Room detail (/rooms/[slug]).
 *
 * Sets the per-room tint on the ambient shader, renders an editorial
 * header (asymmetric 60/40 with mono metadata), an engraved divider,
 * and an asymmetric grid of `<ExhibitCard>` instances. Floor navigation
 * to the previous/next gallery lives at the bottom.
 */
export default function RoomPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? '';

  const roomIndex = MUSEUM_ROOMS.findIndex((r) => r.slug === slug);
  const roomInfo = roomIndex !== -1 ? MUSEUM_ROOMS[roomIndex] : null;
  const tintName = ROOM_TINT_MAP[slug] ?? 'brass';

  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint(tintName);
    return () => setRoomTint('brass');
  }, [tintName, setRoomTint]);

  const [roomData, setRoomData] = useState<RoomDetailView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.rooms
      .get(slug)
      .then((data) => setRoomData(data as RoomDetailView))
      .catch(() => setRoomData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const prevRoom =
    roomIndex !== -1
      ? MUSEUM_ROOMS[roomIndex === 0 ? MUSEUM_ROOMS.length - 1 : roomIndex - 1]
      : null;
  const nextRoom =
    roomIndex !== -1
      ? MUSEUM_ROOMS[roomIndex === MUSEUM_ROOMS.length - 1 ? 0 : roomIndex + 1]
      : null;

  const exhibits = roomData?.exhibits ?? [];

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <Breadcrumb roomName={roomInfo?.name} />

          {loading ? (
            <SkeletonHeader />
          ) : (
            <Header
              roomInfo={roomInfo}
              roomData={roomData}
              tintName={tintName}
            />
          )}

          <div className="mt-16">
            <EngravedDivider label={`// EXHIBITS · ${exhibits.length}`} />
          </div>

          <section className="mt-12 mb-32">
            {loading ? (
              <SkeletonGrid />
            ) : exhibits.length === 0 ? (
              <EmptyComposed
                title="This room is quiet."
                caption="No preservations have settled here yet. Try another gallery, or be the first to hang one on the wall."
              />
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {exhibits.map((exhibit, i) => {
                  const span = i % 4 === 0 || i % 4 === 3 ? 'md:col-span-7' : 'md:col-span-5';
                  return (
                    <ExhibitCard
                      key={exhibit.id}
                      exhibit={exhibit}
                      index={i}
                      className={span}
                    />
                  );
                })}
              </motion.div>
            )}
          </section>

          {prevRoom && nextRoom && (
            <FloorNavigation prevRoom={prevRoom} nextRoom={nextRoom} />
          )}
        </div>
      </main>
    </>
  );
}

// ---- Subcomponents ------------------------------------------------------

function Breadcrumb({ roomName }: { roomName?: string }) {
  return (
    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-whisper mb-12">
      <span>{'// ROOMS / '}{roomName ?? '—'}</span>
      <Link href="/rooms" className="hover:text-brass transition-colors">
        ← Back to all rooms
      </Link>
    </div>
  );
}

function Header({
  roomInfo,
  roomData,
  tintName,
}: {
  roomInfo: (typeof MUSEUM_ROOMS)[number] | null;
  roomData: RoomDetailView | null;
  tintName: RoomTintName;
}) {
  return (
    <header className="grid grid-cols-1 md:grid-cols-12 gap-12">
      <div className="md:col-span-7">
        <Eyebrow>{`Room · ${roomInfo?.slug?.replace(/_/g, ' ') ?? ''}`}</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
          {roomData?.name ?? roomInfo?.name ?? 'Unknown room'}
        </h1>
        <p className="mt-6 font-display text-[clamp(1.125rem,1.4vw,1.375rem)] italic leading-relaxed text-ink-muted max-w-[55ch]">
          {roomData?.description ?? roomInfo?.description}
        </p>
      </div>
      <aside className="md:col-span-4 md:col-start-9 self-end">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper space-y-2">
          <Row label="Tint" value={tintName} />
          {roomInfo?.lighting && (
            <Row label="Lighting" value={roomInfo.lighting.replace(/_/g, ' ')} />
          )}
          {roomInfo?.ambience && (
            <Row label="Ambience" value={roomInfo.ambience.replace(/_/g, ' ')} />
          )}
          <Row
            label="Exhibits"
            value={roomData?.exhibits ? String(roomData.exhibits.length) : '—'}
          />
        </div>
      </aside>
    </header>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function FloorNavigation({
  prevRoom,
  nextRoom,
}: {
  prevRoom: (typeof MUSEUM_ROOMS)[number];
  nextRoom: (typeof MUSEUM_ROOMS)[number];
}) {
  return (
    <section className="border-t border-glass-edge pt-12 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <Link
        href={prevRoom.path}
        className="group flex flex-col gap-2 hover:text-brass transition-colors"
      >
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          <ArrowLeft className="w-3 h-3" /> Previous gallery
        </span>
        <span className="font-display text-[clamp(1.25rem,1.6vw,1.5rem)] text-ink group-hover:text-brass transition-colors">
          {prevRoom.name}
        </span>
      </Link>
      <Link
        href={nextRoom.path}
        className="group flex flex-col gap-2 md:items-end md:text-right hover:text-brass transition-colors"
      >
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          Next gallery <ArrowRight className="w-3 h-3" />
        </span>
        <span className="font-display text-[clamp(1.25rem,1.6vw,1.5rem)] text-ink group-hover:text-brass transition-colors">
          {nextRoom.name}
        </span>
      </Link>
    </section>
  );
}

// ---- Skeletons ----------------------------------------------------------

function SkeletonHeader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 animate-pulse">
      <div className="md:col-span-7 space-y-4">
        <div className="h-3 w-32 bg-vellum rounded-sm" />
        <div className="h-12 w-3/4 bg-vellum rounded-sm" />
        <div className="h-4 w-2/3 bg-vellum rounded-sm" />
        <div className="h-4 w-1/2 bg-vellum rounded-sm" />
      </div>
      <div className="md:col-span-4 md:col-start-9 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-full bg-vellum rounded-sm" />
        ))}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`${i % 4 === 0 || i % 4 === 3 ? 'md:col-span-7' : 'md:col-span-5'} bg-paper border border-glass-edge rounded-lg p-8 min-h-[260px] animate-pulse flex flex-col gap-3`}
        >
          <div className="h-3 w-24 bg-vellum rounded-sm" />
          <div className="h-3 w-32 bg-vellum rounded-sm" />
          <div className="h-7 w-3/4 bg-vellum rounded-sm mt-3" />
          <div className="h-3 w-full bg-vellum rounded-sm" />
          <div className="h-3 w-5/6 bg-vellum rounded-sm" />
        </div>
      ))}
    </div>
  );
}
