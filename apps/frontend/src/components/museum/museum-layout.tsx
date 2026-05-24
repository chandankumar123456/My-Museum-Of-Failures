'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MuseumNavigation } from './navigation';
import { AmbientParticles } from './ambient-particles';
import { DynamicAtmosphere } from './atmosphere';

export function MuseumLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen bg-void">
      <AmbientParticles />
      <DynamicAtmosphere />
      <MuseumNavigation />

      <AnimatePresence mode="wait">
        <motion.main
          ref={mainRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="relative z-10 pt-16"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
