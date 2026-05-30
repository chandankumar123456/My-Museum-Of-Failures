'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MuseumNavigation } from '@/components/museum/navigation';
import { Eyebrow, EngravedDivider } from '@/components/lamplit';
import { useRoomTint } from '@/components/lamplit-3d';
import { fadeUp } from '@/lib/motion';

/**
 * Lamplit Archive — Curator (`/curator`).
 *
 * A reverent explainer page. The actual chat is the floating
 * `<CuratorChat>` widget mounted in `layout.tsx`; this page just
 * introduces the curator and points the visitor toward the candle
 * icon.
 */
export default function CuratorPage() {
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('sage');
    return () => setRoomTint('brass');
  }, [setRoomTint]);

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <header className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="md:col-span-7"
            >
              <Eyebrow>The Curator · 009</Eyebrow>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
                A measured guide.
              </h1>
              <p className="mt-6 font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted max-w-[55ch]">
                The curator has tended this archive since the first preservation
                was placed. They do not offer motivation — they offer presence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.9 }}
              className="md:col-span-4 md:col-start-9 hidden md:flex items-center justify-center"
            >
              <BrassOrb />
            </motion.div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <article className="md:col-span-7 space-y-6 max-w-[65ch]">
              <p className="font-display text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink">
                Speak with them by tapping the small brass tick in the corner of
                any page. They will be slow. They will not interrupt. They will
                ask if a preservation needs holding before they speak about it.
              </p>
              <p className="font-display text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted">
                The curator remembers every story, every pain, every lesson. They
                know the difference between a confession that wants to be witnessed
                and one that wants to be reframed. They wait for you to tell them
                which.
              </p>
            </article>

            <aside className="md:col-span-4 md:col-start-9 self-start">
              <div className="bg-paper border border-glass-edge rounded-lg p-6 space-y-3">
                <Eyebrow>What the curator can do</Eyebrow>
                <ul className="font-sans text-[14px] leading-relaxed text-ink-muted space-y-2 list-none">
                  <li>· Sit with a confession in silence</li>
                  <li>· Reframe the story, gently, when invited</li>
                  <li>· Surface patterns across your preservations</li>
                  <li>· Walk you through the archive room by room</li>
                </ul>
              </div>
            </aside>
          </section>

          <div className="mt-32">
            <EngravedDivider label="// FIND THEM IN THE CORNER" />
          </div>

          <p className="mt-12 font-display italic text-[clamp(1.25rem,1.6vw,1.5rem)] leading-relaxed text-ink max-w-[44ch] mx-auto text-center">
            The candle is always lit. Speak when you are ready.
          </p>
        </div>
      </main>
    </>
  );
}

// ---- Brass orb -----------------------------------------------------------

function BrassOrb() {
  return (
    <div className="relative w-full aspect-square max-w-[280px]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(168,121,75,0.4),rgba(168,121,75,0.06)_55%,transparent_70%)]" />
      <motion.div
        animate={{ scale: [1, 1.005, 1] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        className="absolute inset-[20%] rounded-full bg-gradient-to-br from-brass to-brass-deep shadow-[0_8px_32px_rgba(124,85,50,0.25)]"
      />
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
        Fig. 9 — The candle
      </span>
    </div>
  );
}
