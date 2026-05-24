import Link from 'next/link';
import { EntranceDoor } from '@/components/museum/entrance-door';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-void overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-void-light via-void to-void" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <p className="text-whisper-dark font-mono text-sm tracking-[0.3em] uppercase">
              A Digital Museum Of
            </p>
            <h1 className="font-serif text-5xl md:text-7xl text-whisper-light leading-tight">
              My Museum of
              <span className="block text-ember mt-2">Failures</span>
            </h1>
          </div>

          <p className="text-whisper-dark text-lg md:text-xl font-light leading-relaxed max-w-lg mx-auto">
            An emotionally immersive digital museum where failures, regrets, and abandoned
            dreams are preserved as meaningful artifacts.
          </p>

          <div className="pt-8">
            <EntranceDoor />
          </div>

          <div className="flex gap-6 justify-center text-sm text-whisper-dark/60 pt-12">
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
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-museum-800 text-xs font-mono animate-pulse-slow">
          Enter the museum
        </p>
      </div>
    </main>
  );
}
