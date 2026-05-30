'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { api, ApiError } from '@/lib/api';
import { MuseumNavigation } from '@/components/museum/navigation';
import {
  Eyebrow,
  EngravedDivider,
  Input,
  Button,
} from '@/components/lamplit';
import { useRoomTint } from '@/components/lamplit-3d';
import { fadeUp } from '@/lib/motion';

/**
 * Lamplit Archive — Auth (`/auth`).
 *
 * 50/40 asymmetric split. Left holds a brass-key SVG resting on
 * vellum-textured velvet (the "key to the archive"). Right holds the
 * 3-tab form: Sign in / Register / Pseudonym only. Bottom-border-only
 * inputs, brass primary button, no social logins, no remember-me.
 */

type Tab = 'login' | 'register' | 'pseudonym';

export default function AuthPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const { setRoomTint } = useRoomTint();
  useEffect(() => {
    setRoomTint('brass');
  }, [setRoomTint]);

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
        toast('The archive recognises you. Welcome back.');
        router.push('/exhibits');
      } else if (tab === 'register') {
        const { user } = await api.auth.register({ email, password, displayName });
        setUser({
          userId: user.id,
          identityMode: user.identityMode as 'real_name' | 'pseudonym' | 'anonymous',
          displayName: user.displayName ?? null,
          isAnonymous: false,
        });
        toast('Identity preserved. The archive remembers you now.');
        router.push('/exhibits');
      } else {
        const { user } = await api.auth.pseudonym(pseudonym);
        setUser({
          userId: user.id,
          identityMode: user.identityMode as 'real_name' | 'pseudonym' | 'anonymous',
          displayName: user.pseudonym ?? user.displayName ?? null,
          isAnonymous: false,
        });
        toast(`The archive will know you as "${pseudonym}".`);
        router.push('/exhibits');
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? friendlyMessage(err.status, err.message)
          : 'Something broke in the dark. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <MuseumNavigation />

      <main className="min-h-[100dvh] bg-bone text-ink">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center min-h-[calc(100dvh-12rem)]">
            <KeyVisual />
            <FormColumn
              tab={tab}
              setTab={(t) => {
                setTab(t);
                setError('');
              }}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              displayName={displayName}
              setDisplayName={setDisplayName}
              pseudonym={pseudonym}
              setPseudonym={setPseudonym}
              error={error}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          </section>

          <ExplainerRow />
        </div>
      </main>
    </>
  );
}

// ---- Key visual ----------------------------------------------------------

function KeyVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.9 }}
      className="md:col-span-5 hidden md:flex items-center justify-center"
    >
      <div className="relative w-full aspect-square max-w-[440px] bg-vellum rounded-lg flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(168,121,75,0.18),transparent_55%)]" />
        <BrassKey />
        <span className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
          Fig. 1 — The key to the archive
        </span>
      </div>
    </motion.div>
  );
}

function BrassKey() {
  return (
    <svg
      viewBox="0 0 200 80"
      className="w-3/4 max-w-[320px] text-brass drop-shadow-[0_8px_18px_rgba(168,121,75,0.18)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="46" cy="40" r="22" fill="currentColor" fillOpacity="0.18" />
      <circle cx="46" cy="40" r="22" />
      <circle cx="46" cy="40" r="9" />
      <line x1="68" y1="40" x2="172" y2="40" />
      <line x1="148" y1="40" x2="148" y2="54" />
      <line x1="160" y1="40" x2="160" y2="58" />
      <line x1="172" y1="40" x2="172" y2="50" />
    </svg>
  );
}

// ---- Form column --------------------------------------------------------

interface FormColumnProps {
  tab: Tab;
  setTab: (t: Tab) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  pseudonym: string;
  setPseudonym: (v: string) => void;
  error: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function FormColumn(props: FormColumnProps) {
  const {
    tab,
    setTab,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    pseudonym,
    setPseudonym,
    error,
    submitting,
    onSubmit,
  } = props;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="md:col-span-7 max-w-[520px]"
    >
      <Eyebrow>Enter the archive</Eyebrow>
      <h1 className="mt-4 font-display italic text-[clamp(2.5rem,4vw,3.75rem)] leading-[1.05] tracking-tight text-ink">
        {tab === 'login' && 'Sign in.'}
        {tab === 'register' && 'Preserve an identity.'}
        {tab === 'pseudonym' && 'Choose a name.'}
      </h1>
      <p className="mt-4 font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] text-ink-muted">
        {tab === 'login' && 'The archive recognises you.'}
        {tab === 'register' && 'A real account makes your exhibits portable across devices.'}
        {tab === 'pseudonym' && 'No password, no email. Only a name the archive will use.'}
      </p>

      <Tabs tab={tab} setTab={setTab} />

      <AnimatePresence mode="wait">
        <motion.form
          key={tab}
          onSubmit={onSubmit}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-8 space-y-6"
          autoComplete="on"
        >
          {(tab === 'login' || tab === 'register') && (
            <>
              <Input
                label="Email"
                type="email"
                required
                placeholder="you@somewhere"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                required
                minLength={8}
                placeholder="your passphrase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              {tab === 'register' && (
                <Input
                  label="Display name (optional)"
                  placeholder="What should the archive call you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="nickname"
                />
              )}
            </>
          )}

          {tab === 'pseudonym' && (
            <Input
              label="Pseudonym"
              required
              minLength={2}
              placeholder="At least two characters"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              autoComplete="nickname"
            />
          )}

          <p className="font-sans text-[14px] leading-relaxed text-ink-muted max-w-[50ch]">
            If you have not yet been to the archive, you may also enter as
            anonymous. Anonymous archivists may preserve and read; only
            registered ones may pin a legacy.
          </p>

          {error && (
            <p className="font-mono text-[11px] tracking-tight text-rust">{error}</p>
          )}

          <Button variant="primary" size="lg" fullWidth type="submit" disabled={submitting}>
            {submitting
              ? 'Working…'
              : tab === 'login'
                ? 'Sign in to the archive'
                : tab === 'register'
                  ? 'Create the account'
                  : 'Take this name'}
          </Button>

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              href="/exhibits"
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass transition-colors"
            >
              Continue as anonymous →
            </Link>
            <span className="font-mono text-[10px] tracking-tight text-whisper">
              email never shown publicly
            </span>
          </div>
        </motion.form>
      </AnimatePresence>
    </motion.div>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const ALL: Array<[Tab, string]> = [
    ['login', 'Sign in'],
    ['register', 'Register'],
    ['pseudonym', 'Pseudonym only'],
  ];
  return (
    <div className="mt-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em]">
      {ALL.map(([value, label], i) => (
        <span key={value} className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTab(value)}
            className={`pb-2 -mb-px border-b transition-colors ${
              tab === value
                ? 'border-brass text-brass'
                : 'border-transparent text-ink-muted hover:text-brass'
            }`}
          >
            {label}
          </button>
          {i < ALL.length - 1 && <span className="text-whisper">/</span>}
        </span>
      ))}
    </div>
  );
}

// ---- Explainer row -------------------------------------------------------

function ExplainerRow() {
  return (
    <section className="mt-32">
      <EngravedDivider label="// THREE WAYS TO ENTER" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <Explainer
          title="Anonymous"
          body="No identity, no trace. You can preserve and read; you cannot pin a legacy or seal a capsule."
        />
        <Explainer
          title="Pseudonym"
          body="A name the archive uses. Visible to other visitors. No email required."
        />
        <Explainer
          title="Real name"
          body="Email + passphrase. Email stays private. Pseudonym or display name is what others see."
        />
      </div>
    </section>
  );
}

function Explainer({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-3">
      <Eyebrow tick={false} prefix="">{title}</Eyebrow>
      <p className="font-sans text-[14px] leading-relaxed text-ink-muted max-w-[40ch]">
        {body}
      </p>
    </div>
  );
}

// ---- Helpers -------------------------------------------------------------

function friendlyMessage(status: number, raw: string): string {
  if (status === 400) {
    try {
      const body = JSON.parse(raw) as { message?: string | string[] };
      const m = Array.isArray(body.message) ? body.message[0] : body.message;
      if (m) return m;
    } catch {
      /* fall through */
    }
    return 'Please check the form and try again.';
  }
  if (status === 401) return 'Email or password is incorrect.';
  if (status === 429) return 'Too many attempts. Pause for a minute, then try again.';
  if (status >= 500) return 'The archive is temporarily silent. Please try again shortly.';
  return raw || 'Something broke. Please try again.';
}
