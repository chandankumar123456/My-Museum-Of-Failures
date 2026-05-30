'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Volume2, VolumeX, Menu, X } from 'lucide-react';
import { useAudioStore } from '@/stores/audio-store';
import { useAuthStore } from '@/stores/auth-store';
import { IdentityBadge } from '@/components/auth/identity-badge';
import { cn } from '@/lib/utils';

/**
 * Lamplit Archive — Top navigation.
 *
 * Sticky bone-tinted bar with hairline glass-edge underline. Brass tick
 * + JetBrains Mono wordmark on the left, sans-caps nav links centre,
 * identity badge + audio toggle right. The active link uses a brass
 * underline (animated layoutId) instead of a colour swap, so pages in
 * different per-room tints remain readable.
 */

const NAV_ITEMS = [
  { href: '/exhibits', label: 'Archive' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/exhibits/create', label: 'Preserve' },
  { href: '/curator', label: 'Curator' },
  { href: '/constellation', label: 'Constellation' },
  { href: '/time-capsule', label: 'Capsules' },
  { href: '/about', label: 'About' },
];

export function MuseumNavigation() {
  const pathname = usePathname();
  const { isMuted, toggleMute } = useAudioStore();
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(`${href}/`));

  return (
    <nav
      className={cn(
        'sticky top-0 z-40 w-full backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'bg-bone/95 border-b border-glass-edge shadow-[0_1px_0_rgba(168,121,75,0.12),0_10px_30px_-18px_rgba(23,21,20,0.45)]'
          : 'bg-bone/85 border-b border-transparent',
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:text-brass transition-colors whitespace-nowrap"
        >
          <span className="brass-tick" aria-hidden />
          <span className="font-semibold">Museum of Failures</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative font-sans text-[13px] tracking-tight py-1 transition-colors',
                isActive(item.href)
                  ? 'text-ink font-medium'
                  : 'text-ink-muted hover:text-brass',
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <motion.div
                  layoutId="lamplit-nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-px bg-brass"
                  transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.9 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-4">
          {isAnonymous && pathname !== '/auth' && (
            <Link
              href="/auth"
              className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass transition-colors"
            >
              Sign in
            </Link>
          )}
          <IdentityBadge />
          <button
            onClick={toggleMute}
            className="inline-flex items-center justify-center w-11 h-11 -mr-1 text-ink-muted hover:text-brass transition-colors rounded-sm"
            title={isMuted ? 'Unmute museum' : 'Mute museum'}
            aria-label={isMuted ? 'Unmute museum' : 'Mute museum'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 stroke-[1.5]" />
            ) : (
              <Volume2 className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>
          <button
            className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 text-ink hover:text-brass transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
          </button>
        </div>
      </div>

      {/* Mobile drop-down */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.9 }}
            className="md:hidden bg-paper border-t border-glass-edge overflow-hidden"
          >
            <div className="px-6 py-4 space-y-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block font-sans text-[14px] py-1 transition-colors',
                    isActive(item.href)
                      ? 'text-brass font-medium'
                      : 'text-ink-muted hover:text-brass',
                  )}
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
