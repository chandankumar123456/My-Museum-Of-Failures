'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

interface TimeCapsuleCreateProps {
  userId: string;
  onSuccess?: () => void;
}

export function TimeCapsuleCreate({ userId, onSuccess }: TimeCapsuleCreateProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [creating, setCreating] = useState(false);

  const submit = async () => {
    if (!title || !message || !unlockDate) return;
    setCreating(true);
    try {
      await api.timeCapsule.create({ userId, title, message, unlockDate });
      onSuccess?.();
      setTitle('');
      setMessage('');
      setUnlockDate('');
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="museum-card p-6 space-y-4">
      <h3 className="font-serif text-xl text-whisper">Write to Your Future Self</h3>
      <p className="text-sm text-whisper-dark font-light">
        Seal a message. The museum will keep it until you&apos;re ready.
      </p>

      <div>
        <input
          type="text"
          placeholder="Capsule title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-void border border-museum-800 rounded-sm px-4 py-2 text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none"
        />
      </div>

      <div>
        <textarea
          placeholder="What do you want your future self to remember?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full bg-void border border-museum-800 rounded-sm px-4 py-2 text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-whisper-dark mb-1">Unlock Date</label>
        <input
          type="date"
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
          className="w-full bg-void border border-museum-800 rounded-sm px-4 py-2 text-whisper focus:border-ember/50 focus:outline-none"
        />
      </div>

      <button
        onClick={submit}
        disabled={creating || !title || !message || !unlockDate}
        className="w-full py-2 bg-ember/20 border border-ember/50 rounded-sm text-ember hover:bg-ember/30 transition-colors disabled:opacity-30"
      >
        {creating ? 'Sealing...' : 'Seal Capsule'}
      </button>
    </div>
  );
}
