import Link from 'next/link';
import { EntranceDoor } from '@/components/museum/entrance-door';
import { AmbientParticles } from '@/components/museum/ambient-particles';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-void overflow-hidden">
      <AmbientParticles />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-void-light/30 via-void to-void pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void/80 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <p className="text-whisper-dark font-mono text-sm tracking-[0.3em] uppercase animate-pulse-slow">
              A Digital Museum Of
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-whisper-light leading-tight">
              My Museum of
              <span className="block text-ember mt-2 animate-flicker">Failures</span>
            </h1>
          </div>

          <p className="text-whisper-dark text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto">
            An emotionally immersive digital museum where failures, regrets, and abandoned
            dreams are preserved as meaningful artifacts.
          </p>

          <div className="pt-8">
            <EntranceDoor />
          </div>

          <nav
            aria-label="Museum entries"
            className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm text-whisper-dark/70 pt-12"
          >
            <Link href="/about" className="hover:text-whisper transition-colors duration-300">
              About
            </Link>
            <span className="text-museum-800">|</span>
            <Link href="/exhibits" className="hover:text-whisper transition-colors duration-300">
              Explore Exhibits
            </Link>
            <span className="text-museum-800">|</span>
            <Link href="/rooms" className="hover:text-whisper transition-colors duration-300">
              Museum Rooms
            </Link>
            <span className="text-museum-800">|</span>
            <Link href="/curator" className="hover:text-whisper transition-colors duration-300">
              The Curator
            </Link>
            <span className="text-museum-800">|</span>
            <Link
              href="/constellation"
              className="hover:text-whisper transition-colors duration-300"
            >
              Constellation
            </Link>
          </nav>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <p className="text-museum-700 text-xs font-mono tracking-[0.3em] uppercase animate-pulse-slow">
          Enter the museum
        </p>
      </div>
    </main>
  );
}
