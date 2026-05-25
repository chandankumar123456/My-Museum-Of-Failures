'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { useAuthStore } from '@/stores/auth-store';
import { api, ApiError } from '@/lib/api';

type Tab = 'login' | 'register' | 'pseudonym';

export default function AuthPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (tab === 'login') {
        const { user } = await api.auth.login({ email, password });
        setUser({
          userId: user.id,
          identityMode: user.identityMode as 'real_name' | 'pseudonym' | 'anonymous',
          displayName: user.displayName ?? null,
          isAnonymous: false,
        });
        toast.success('Welcome back to the museum.');
        router.push('/exhibits');
      } else if (tab === 'register') {
        const { user } = await api.auth.register({ email, password, displayName });
        setUser({
          userId: user.id,
          identityMode: user.identityMode as 'real_name' | 'pseudonym' | 'anonymous',
          displayName: user.displayName ?? null,
          isAnonymous: false,
        });
        toast.success('Identity preserved. The archive remembers you now.');
        router.push('/exhibits');
      } else {
        const { user } = await api.auth.pseudonym(pseudonym);
        setUser({
          userId: user.id,
          identityMode: user.identityMode as 'real_name' | 'pseudonym' | 'anonymous',
          displayName: user.pseudonym ?? user.displayName ?? null,
          isAnonymous: false,
        });
        toast.success(`The museum will know you as “${pseudonym}.”`);
        router.push('/exhibits');
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? friendlyMessage(err.status, err.message)
          : 'Something broke in the dark. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MuseumLayout>
      <div className="max-w-md mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-serif text-4xl text-whisper-light mb-2 text-center">
            {tab === 'login' && 'Return to the Museum'}
            {tab === 'register' && 'Preserve an Identity'}
            {tab === 'pseudonym' && 'Choose a Pseudonym'}
          </h1>
          <p className="text-center text-whisper-dark text-sm font-light mb-8">
            {tab === 'login' && 'Sign in to continue your archive.'}
            {tab === 'register' && 'A real account makes your exhibits portable across devices.'}
            {tab === 'pseudonym' && 'No password. No email. Just a name the archive will know you by.'}
          </p>

          <div className="flex border-b border-museum-800 mb-6 text-sm">
            {([
              ['login', 'Sign in'],
              ['register', 'Register'],
              ['pseudonym', 'Pseudonym'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTab(value);
                  setError('');
                }}
                className={`flex-1 py-3 transition-colors ${
                  tab === value
                    ? 'text-ember border-b border-ember -mb-px'
                    : 'text-whisper-dark hover:text-whisper'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              onSubmit={onSubmit}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
              autoComplete="on"
            >
              {(tab === 'login' || tab === 'register') && (
                <>
                  <Field label="Email">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Password">
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                      className={inputClass}
                    />
                  </Field>
                  {tab === 'register' && (
                    <Field label="Display name (optional)">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="What should the curator call you?"
                        autoComplete="nickname"
                        className={inputClass}
                      />
                    </Field>
                  )}
                </>
              )}

              {tab === 'pseudonym' && (
                <Field label="Pseudonym">
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    placeholder="At least 2 characters"
                    autoComplete="nickname"
                    className={inputClass}
                  />
                </Field>
              )}

              {error && (
                <div className="text-sm text-red-400 border border-red-900/40 bg-red-900/10 rounded-sm px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-ember/20 border border-ember/50 rounded-sm text-ember hover:bg-ember/30 transition-colors disabled:opacity-30"
              >
                {submitting
                  ? 'Working…'
                  : tab === 'login'
                    ? 'Sign in'
                    : tab === 'register'
                      ? 'Create account'
                      : 'Take this name'}
              </button>

              <p className="text-xs text-museum-600 text-center pt-2">
                Or continue as anonymous —{' '}
                <Link href="/exhibits" className="underline hover:text-whisper">
                  visit the archive without an identity
                </Link>
                .
              </p>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </MuseumLayout>
  );
}

const inputClass =
  'w-full bg-void border border-museum-800 rounded-sm px-4 py-2 text-whisper placeholder:text-museum-600 focus:border-ember/50 focus:outline-none transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-museum-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function friendlyMessage(status: number, raw: string): string {
  if (status === 400) {
    try {
      const body = JSON.parse(raw) as { message?: string | string[] };
      const m = Array.isArray(body.message) ? body.message[0] : body.message;
      if (m) return m;
    } catch {
      /* fall through */
    }
    return 'Please check the form fields and try again.';
  }
  if (status === 401) return 'Email or password is incorrect.';
  if (status === 429) return 'Too many attempts. Pause for a minute, then try again.';
  if (status >= 500) return 'The museum is temporarily silent. Please try again shortly.';
  return raw || 'Something broke. Please try again.';
}
