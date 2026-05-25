'use client';

interface MemoryDecayOverlayProps {
  decayLevel: number;
  children: React.ReactNode;
}

export function MemoryDecayOverlay({ decayLevel, children }: MemoryDecayOverlayProps) {
  const dustOpacity = Math.min(decayLevel * 0.08, 0.4);
  const crackIntensity = Math.min(decayLevel * 0.15, 0.7);

  return (
    <div className="relative">
      {children}

      {/* Dust overlay */}
      {decayLevel > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 60%, rgba(42, 36, 32, ${dustOpacity}) 100%)`,
          }}
        />
      )}

      {/* Crack overlay */}
      {decayLevel >= 3 && (
        <svg
          className="absolute inset-0 pointer-events-none w-full h-full"
          viewBox="0 0 200 200"
          style={{ opacity: crackIntensity }}
        >
          <path
            d="M50,10 L55,40 L30,60 L70,90 L45,120 L80,150"
            stroke="#52473c"
            strokeWidth="0.5"
            fill="none"
          />
          <path
            d="M150,20 L140,55 L160,80 L130,100 L145,130"
            stroke="#52473c"
            strokeWidth="0.5"
            fill="none"
          />
        </svg>
      )}

      {/* Faded border */}
      {decayLevel >= 2 && (
        <div
          className="absolute inset-0 pointer-events-none border border-museum-800"
          style={{ opacity: decayLevel * 0.1 }}
        />
      )}
    </div>
  );
}
