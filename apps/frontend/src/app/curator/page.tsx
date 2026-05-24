'use client';

import { MuseumLayout } from '@/components/museum/museum-layout';
import { CuratorChat } from '@/components/ai/curator-chat';

export default function CuratorPage() {
  return (
    <MuseumLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <span className="text-6xl mb-4 block">🕯️</span>
          <h1 className="font-serif text-4xl text-whisper-light mb-2">The Museum Curator</h1>
          <p className="text-whisper-dark font-light">
            A melancholic guide who tends to the exhibits and the silence between them.
          </p>
        </div>

        <div className="museum-card p-8 border-ember/10">
          <div className="prose prose-invert max-w-none">
            <p className="text-whisper-dark font-light leading-relaxed">
              The curator has been here since the first exhibit was placed. They remember every story,
              every pain, every lesson. They do not offer motivation — they offer presence.
            </p>
            <p className="text-whisper-dark font-light leading-relaxed mt-4">
              Click the candle icon in the bottom-right corner to speak with them.
            </p>
          </div>
        </div>

        <CuratorChat />
      </div>
    </MuseumLayout>
  );
}
