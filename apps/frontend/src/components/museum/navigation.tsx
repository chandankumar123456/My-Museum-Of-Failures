'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAudioStore } from '@/stores/audio-store';
import { motion } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { href: '/exhibits', label: 'Exhibits' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/exhibits/create', label: '+ New Exhibit' },
  { href: '/curator', label: 'Curator' },
];

export function MuseumNavigation() {
  const pathname = usePathname();
  const { isMuted, toggleMute } = useAudioStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-pane">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-whisper text-lg tracking-wide hover:text-ember transition-colors">
          Museum of Failures
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm tracking-wider uppercase transition-colors duration-300',
                pathname === item.href
                  ? 'text-ember'
                  : 'text-whisper-dark hover:text-whisper',
              )}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={toggleMute}
            className="text-whisper-dark hover:text-whisper transition-colors text-sm"
            title={isMuted ? 'Unmute museum' : 'Mute museum'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        <button
          className="md:hidden text-whisper"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm">{isOpen ? 'Close' : 'Menu'}</span>
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-pane border-t border-museum-800"
        >
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block text-sm tracking-wider uppercase transition-colors',
                  pathname === item.href ? 'text-ember' : 'text-whisper-dark hover:text-whisper',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
