'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAudioStore } from '@/stores/audio-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { IdentityBadge } from '@/components/auth/identity-badge';

const navItems = [
  { href: '/exhibits', label: 'Exhibits' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/exhibits/create', label: '+ New Exhibit' },
  { href: '/curator', label: 'Curator' },
  { href: '/time-capsule', label: 'Capsules' },
];

export function MuseumNavigation() {
  const pathname = usePathname();
  const { isMuted, toggleMute } = useAudioStore();
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = (href: string) =>
    cn(
      'text-sm tracking-wider uppercase transition-colors duration-300',
      pathname === href ? 'text-ember' : 'text-whisper-dark hover:text-whisper',
    );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-pane">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-serif text-whisper text-lg tracking-wide hover:text-ember transition-colors whitespace-nowrap"
        >
          Museum of Failures
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <IdentityBadge />
          <button
            onClick={toggleMute}
            className="text-whisper-dark hover:text-whisper transition-colors text-sm"
            title={isMuted ? 'Unmute museum' : 'Mute museum'}
            aria-label={isMuted ? 'Unmute museum' : 'Mute museum'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            className="md:hidden text-whisper text-sm"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-pane border-t border-museum-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn('block', linkClass(item.href))}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
