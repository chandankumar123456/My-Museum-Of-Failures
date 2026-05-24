'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MUSEUM_ROOMS } from '@/lib/constants';

const roomStyles: Record<string, { gradient: string; border: string }> = {
  hall_of_broken_dreams: { gradient: 'from-amber-900/20 via-void to-void', border: 'border-amber-900/30' },
  startup_cemetery: { gradient: 'from-blue-900/20 via-void to-void', border: 'border-blue-900/30' },
  burnout_basement: { gradient: 'from-red-900/20 via-void to-void', border: 'border-red-900/30' },
  academic_ruins: { gradient: 'from-stone-900/20 via-void to-void', border: 'border-stone-900/30' },
  gallery_of_lost_potential: { gradient: 'from-purple-900/20 via-void to-void', border: 'border-purple-900/30' },
  the_regret_archive: { gradient: 'from-teal-900/20 via-void to-void', border: 'border-teal-900/30' },
  abandoned_futures_wing: { gradient: 'from-gray-900/20 via-void to-void', border: 'border-gray-900/30' },
  relationship_graveyard: { gradient: 'from-rose-900/20 via-void to-void', border: 'border-rose-900/30' },
};

export function RoomCard({ room, index = 0 }: { room: typeof MUSEUM_ROOMS[0]; index?: number }) {
  const style = roomStyles[room.slug] || roomStyles.hall_of_broken_dreams;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link href={room.path}>
        <div
          className={`group relative museum-card p-6 bg-gradient-to-br ${style.gradient} border ${style.border} hover:brightness-110 transition-all duration-500 cursor-pointer h-full`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-serif text-2xl text-whisper mb-2 group-hover:text-ember transition-colors">
                {room.name}
              </h3>
              <p className="text-whisper-dark text-sm font-light leading-relaxed">
                {room.description}
              </p>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-museum-800">
              <span className="text-xs text-museum-600 capitalize">{room.ambience.replace(/_/g, ' ')}</span>
              <span className="text-xs text-ember opacity-0 group-hover:opacity-100 transition-opacity">
                Enter Room →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
