'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function EntranceDoor() {
  return (
    <Link href="/exhibits">
      <motion.div
        className="relative inline-block cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative w-48 h-64 border border-museum-700 overflow-hidden rounded-md bg-void-light">
          <div className="absolute inset-0 bg-gradient-to-b from-void-light via-transparent to-void/80" />

          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-24 border-2 border-museum-600 rounded-md relative">
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-3 bg-ember/60 rounded-full" />
            </div>
            <motion.span
              className="font-serif text-whisper text-lg tracking-widest"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Enter
            </motion.span>
          </div>

          <div className="absolute inset-0 border border-ember/0 group-hover:border-ember/30 transition-colors duration-700" />
        </div>

        <div className="absolute -inset-1 bg-gradient-to-b from-ember/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm" />
      </motion.div>
    </Link>
  );
}
