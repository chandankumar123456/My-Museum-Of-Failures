'use client';

import { MuseumLayout } from '@/components/museum/museum-layout';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <MuseumLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="font-serif text-4xl text-whisper-light mb-6">About the Museum</h1>

          <div className="space-y-6 text-whisper-dark font-light leading-relaxed">
            <p>
              <strong className="text-whisper">Museums normally celebrate achievements.</strong>
              {" "}This one preserves failures as meaningful artifacts.
            </p>

            <p>
              Success is everywhere on the internet. Failure is hidden.
              This museum exists to preserve what people lost, what never worked,
              what broke them, what changed them, and what still hurts.
            </p>

            <p>
              Every exhibit is a story someone chose not to hide. Some are anonymous.
              Some use pseudonyms. Some are signed with real names.
              All of them are human.
            </p>

            <div className="museum-card p-6 border-ember/20 my-8">
              <p className="text-whisper font-serif text-lg italic text-center">
                &ldquo;The goal is not motivation culture or toxic positivity.
                The goal is emotional honesty.&rdquo;
              </p>
            </div>

            <h2 className="font-serif text-2xl text-whisper mt-8 mb-4">What You&apos;ll Find Here</h2>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-ember mt-1">✦</span>
                <span><strong className="text-whisper">Museum Rooms</strong> — Themed galleries like Startup Cemetery, Burnout Basement, and the Hall of Broken Dreams.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ember mt-1">✦</span>
                <span><strong className="text-whisper">Emotional Reactions</strong> — Not likes. Genuine responses like &ldquo;I relate&rdquo; and &ldquo;This hurt.&rdquo;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ember mt-1">✦</span>
                <span><strong className="text-whisper">AI Reflections</strong> — The curator offers gentle observations on each exhibit.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ember mt-1">✦</span>
                <span><strong className="text-whisper">Time Capsules</strong> — Write to your future self. The museum will keep your message.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-ember mt-1">✦</span>
                <span><strong className="text-whisper">Anonymous Posting</strong> — Share without fear. Identity is always your choice.</span>
              </li>
            </ul>

            <h2 className="font-serif text-2xl text-whisper mt-8 mb-4">The Philosophy</h2>

            <p>
              This platform is not designed to make you feel motivated.
              It is designed to make you feel understood.
            </p>

            <p>
              We do not optimize for engagement. We optimize for emotional honesty.
              There are no likes, no follower counts, no algorithms pushing addictive content.
              There are only stories, preserved in the dark, waiting to be discovered.
            </p>

            <p className="text-museum-600 text-sm mt-8">
              &ldquo;My Museum of Failures&rdquo; — an emotionally immersive digital museum
              where failures are preserved as meaningful artifacts.
            </p>
          </div>
        </motion.div>
      </div>
    </MuseumLayout>
  );
}
