'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { Input, Textarea, Button, Eyebrow } from '@/components/lamplit';

interface TimeCapsuleCreateProps {
  userId: string;
  onSuccess?: () => void;
}

/**
 * Lamplit Archive — Time capsule create form.
 *
 * Inline form rendered inside the time-capsule page. Uses lamplit
 * `<Input>` / `<Textarea>` (bottom-border-only with brass focus underline)
 * and `<Button>` (brass primary, full width). Mono-caps labels, restrained
 * helper copy, no toast / modal — the parent collapses the form on
 * success.
 */
export function TimeCapsuleCreate({ userId, onSuccess }: TimeCapsuleCreateProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title || !message || !unlockDate) return;
    setCreating(true);
    setError(null);
    try {
      await api.timeCapsule.create({ userId, title, message, unlockDate });
      onSuccess?.();
      setTitle('');
      setMessage('');
      setUnlockDate('');
    } catch {
      setError('The seal would not hold. Try again in a moment.');
    } finally {
      setCreating(false);
    }
  };

  const canSubmit = Boolean(title && message && unlockDate);

  return (
    <div className="bg-paper border border-glass-edge rounded-lg p-8 md:p-10 space-y-8">
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-brass mt-1" strokeWidth={1.5} />
        <div className="space-y-1">
          <Eyebrow>Write to your future self</Eyebrow>
          <p className="font-sans text-[14px] leading-relaxed text-ink-muted max-w-[55ch]">
            Seal a message. The archive will keep it locked until the date you
            choose — not a day before.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Input
          label="Capsule title"
          placeholder="A reflection on the shutdown of Project X"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          label="Your reflection"
          placeholder="What do you want your future self to remember? What did you learn?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
        />

        <Input
          label="Unlock date"
          type="date"
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
          helper="Choose a date in the future. It cannot be opened earlier."
        />
      </div>

      {error && (
        <p className="font-mono text-[11px] tracking-tight text-rust">{error}</p>
      )}

      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={submit}
        disabled={creating || !canSubmit}
      >
        {creating ? 'Sealing the capsule…' : 'Seal the capsule'}
      </Button>
    </div>
  );
}
