'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { MuseumNavigation } from '@/components/museum/navigation';
import { Eyebrow, EngravedDivider, Tag, Button, Parallax } from '@/components/lamplit';
import { useRoomTint, ROOM_TINTS, type RoomTintName } from '@/components/lamplit-3d';
import { fadeUp, stagger } from '@/lib/motion';
import { MUSEUM_ROOMS } from '@/lib/constants';

/**
 * Lamplit Archive — Rooms (`/rooms`).
 *
 * Eight themed galleries laid out in a 12-column asymmetric editorial
 * grid, plus two "special walk" cards (Random Walk + Last Attempts).
 * Each room card carries its own atmospheric tint as an accent only —
 * the chrome stays bone.
 */

// Map each canonical room slug to a Lamplit per-room tint name.
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

// Display number per room — read as a docent's slot label.
const ROOM_TAGS: Record<string, string> = {
  hall_of_broken_dreams: 'GALLERY · I',
  startup_cemetery: 'GALLERY · II',
  burnout_basement: 'GALLERY · III',
  academic_ruins: 'GALLERY · IV',
  gallery_of_lost_potential: 'GALLERY · V',
  the_regret_archive: 'GALLERY · VI',
  abandoned_futures_wing: 'GALLERY · VII',
  relationship_graveyard: 'GALLERY · VIII',
};

// Asymmetric column spans, repeating in a 4-card pattern.
const SPAN_PATTERN = [
  'md:col-span-7',
  'md:col-span-5',
  'md:col-span-5',
  'md:col-span-7',
];

export default function RoomsPage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <Header />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10%' }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-32"
          >
            {MUSEUM_ROOMS.map((room, i) => (
              <RoomCard
                key={room.slug}
                room={room}
                index={i}
                tintName={ROOM_TINT_MAP[room.slug]}
                tag={ROOM_TAGS[room.slug] ?? `GALLERY · ${i + 1}`}
                className={SPAN_PATTERN[i % SPAN_PATTERN.length]}
              />
            ))}
          </motion.div>

          <EngravedDivider label="// SPECIAL WALKS" />

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <SpecialWalkCard
              eyebrow="// SPECIAL WALK / 01"
              title="Random Walk"
              caption="Ten exhibits, chosen at random across all eight rooms."
              cta="Begin the walk"
              href="/rooms/random-walk"
              tintName="pearl"
            />
            <SpecialWalkCard
              eyebrow="// SPECIAL WALK / 02"
              title="Last Attempts"
              caption="Failures that stayed open. Where someone wanted to try one more time."
              cta="Open the list"
              href="/rooms/last-attempts"
              tintName="amber"
            />
          </section>
        </div>
      </main>
    </>
  );
}

// ---- Header -------------------------------------------------------------

function Header() {
  return (
    <header className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
      <Parallax offset={24} className="md:col-span-7">
        <Eyebrow>The Rooms · 003</Eyebrow>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
          Eight rooms, one archive.
        </h1>
        <p className="mt-6 font-display text-[clamp(1.125rem,1.4vw,1.375rem)] italic leading-relaxed text-ink-muted max-w-[55ch]">
          Each gallery groups failures by their emotional weight. Step in
          carefully — every room has its own light.
        </p>
      </Parallax>
      <aside className="md:col-span-4 md:col-start-9 self-end">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-whisper space-y-2">
          <div className="flex justify-between">
            <span>Galleries</span>
            <span className="text-ink">8</span>
          </div>
          <div className="flex justify-between">
            <span>Special walks</span>
            <span className="text-ink">2</span>
          </div>
          <div className="flex justify-between">
            <span>Mood</span>
            <span className="text-ink">measured</span>
          </div>
        </div>
      </aside>
    </header>
  );
}

// ---- Room card ----------------------------------------------------------

interface RoomCardProps {
  room: (typeof MUSEUM_ROOMS)[number];
  index: number;
  tintName: RoomTintName;
  tag: string;
  className?: string;
}

function RoomCard({ room, tintName, tag, className = '' }: RoomCardProps) {
  const tint = ROOM_TINTS[tintName];

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -2 }} className={className}>
      <Link
        href={room.path}
        className="group flex flex-col gap-4 bg-paper border border-glass-edge rounded-lg p-8 md:p-10 min-h-[280px] h-full transition-colors hover:border-brass/40"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
            {tag}
          </span>
          {/* Tint chip — the only place the per-room hue appears in the chrome. */}
          <span
            aria-hidden
            className="inline-block w-3 h-3 rounded-sm border border-glass-edge"
            style={{ backgroundColor: tint }}
          />
        </div>

        <h2 className="mt-2 font-display text-[clamp(1.5rem,2vw,2.25rem)] leading-snug text-ink group-hover:text-brass transition-colors">
          {room.name}
        </h2>

        <p className="font-sans text-[15px] leading-relaxed text-ink-muted max-w-[42ch]">
          {room.description}
        </p>

        <div className="mt-auto pt-6 border-t border-glass-edge flex items-center justify-between gap-4">
          <Tag tone="muted">{room.ambience.replace(/_/g, ' ')}</Tag>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass group-hover:text-brass-deep">
            Enter →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ---- Special walk card --------------------------------------------------

interface SpecialWalkCardProps {
  eyebrow: string;
  title: string;
  caption: string;
  cta: string;
  href: string;
  tintName: RoomTintName;
}

function SpecialWalkCard({ eyebrow, title, caption, cta, href, tintName }: SpecialWalkCardProps) {
  const tint = ROOM_TINTS[tintName];
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <Link
        href={href}
        className="group block bg-paper border border-glass-edge rounded-lg p-8 md:p-10 min-h-[220px] transition-colors hover:border-brass/40"
      >
        <div className="flex items-center gap-2 mb-6">
          <span
            aria-hidden
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: tint }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
            {eyebrow}
          </span>
        </div>
        <h3 className="font-display italic text-[clamp(1.5rem,2vw,2.25rem)] leading-snug text-ink">
          {title}
        </h3>
        <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-muted max-w-[44ch]">
          {caption}
        </p>
        <div className="mt-8">
          <Button variant="outline" size="sm" tabIndex={-1}>
            {cta}
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
