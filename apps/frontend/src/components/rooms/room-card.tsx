'use client';
 
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MUSEUM_ROOMS } from '@/lib/constants';
 
export function RoomCard({ room, index = 0 }: { room: typeof MUSEUM_ROOMS[0]; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link href={room.path}>
        <div
          className="group relative museum-card p-6 bg-gradient-to-br from-museum-stone/20 via-void-black to-void-black border border-museum-border/60 hover:border-ember/30 transition-all duration-500 cursor-pointer h-full"
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
 
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-museum-border/40">
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
