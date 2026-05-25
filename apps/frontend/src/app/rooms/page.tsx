'use client';

import Link from 'next/link';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { RoomCard } from '@/components/rooms/room-card';
import { MUSEUM_ROOMS } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function RoomsPage() {
  return (
    <MuseumLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl text-whisper-light mb-2">Museum Rooms</h1>
          <p className="text-whisper-dark font-light">
            Explore themed galleries. Each room holds different kinds of failure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MUSEUM_ROOMS.map((room, i) => (
            <RoomCard key={room.slug} room={room} index={i} />
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/rooms/random-walk" className="block museum-card p-6 hover:border-ember/30 transition-colors">
              <h3 className="font-serif text-xl text-whisper mb-2">🚶 Random Museum Walk</h3>
              <p className="text-whisper-dark text-sm font-light">
                Wander aimlessly through the archives. Let fate choose what you discover.
              </p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/rooms/last-attempts" className="block museum-card p-6 hover:border-ember/30 transition-colors">
              <h3 className="font-serif text-xl text-whisper mb-2">🎯 The Last Attempt</h3>
              <p className="text-whisper-dark text-sm font-light">
                Stories of final tries. The people who went back for one more round.
              </p>
            </Link>
          </motion.div>
        </div>
      </div>
    </MuseumLayout>
  );
}
