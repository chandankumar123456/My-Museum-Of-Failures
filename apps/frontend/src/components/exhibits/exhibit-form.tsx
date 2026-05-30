'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CATEGORIES, ENDING_STATUSES, RECOVERY_STATUSES, EVOLUTION_STATUSES } from '@/lib/constants';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import {
  Eyebrow,
  EngravedDivider,
  Input,
  Textarea,
  Button,
  Tag,
} from '@/components/lamplit';
import { fadeUp } from '@/lib/motion';

/**
 * Lamplit Archive — Preserve a Failure (5-step form).
 *
 * Five stations, each rendered as a single Fraunces headline + a small
 * editorial body, plus the relevant inputs (lamplit Input/Textarea,
 * paper-card pickers, brass-tinted sliders). The progress strip lives
 * in mono-caps with a brass tick on the active station.
 */

interface ExhibitFormProps {
  onSuccess?: (exhibit: unknown) => void;
}

const STEPS = [
  { num: '01', label: 'The Failure' },
  { num: '02', label: 'The Story' },
  { num: '03', label: 'The Lesson' },
  { num: '04', label: 'The Weight' },
  { num: '05', label: 'Review' },
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'anonymous', label: 'Anonymous' },
  { value: 'pseudonym', label: 'Pseudonym' },
  { value: 'real_name', label: 'Real name' },
] as const;

export function ExhibitForm({ onSuccess }: ExhibitFormProps) {
  const { userId } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    category: '',
    story: '',
    expectedOutcome: '',
    actualOutcome: '',
    lessonLearned: '',
    emotionalState: '',
    painLevel: 5,
    regretLevel: 5,
    recoveryProgress: 0,
    stillHurts: true,
    wouldRetry: false,
    endingStatus: 'still_unresolved',
    recoveryStatus: 'healing',
    visibilityMode: 'anonymous',
    emotionalTags: [] as string[],
    parentFailureId: '',
    evolutionStatus: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [priorExhibits, setPriorExhibits] = useState<{ id: string; title: string }[]>([]);

  // Prior attempts by this author become candidate parents for an evolution link.
  useEffect(() => {
    if (!userId) return;
    api.exhibits
      .list(`userId=${encodeURIComponent(userId)}&limit=50`)
      .then((d) =>
        setPriorExhibits(
          ((d as { exhibits?: { id: string; title: string }[] }).exhibits ?? []).map((e) => ({
            id: e.id,
            title: e.title,
          })),
        ),
      )
      .catch(() => {});
  }, [userId]);

  const update = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addTag = () => {
    const v = tagInput.trim();
    if (v && !form.emotionalTags.includes(v)) {
      update('emotionalTags', [...form.emotionalTags, v]);
      setTagInput('');
    }
  };
  const removeTag = (t: string) =>
    update('emotionalTags', form.emotionalTags.filter((x) => x !== t));

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const exhibit = await api.exhibits.create({
        ...form,
        userId,
        parentFailureId: form.parentFailureId || undefined,
        evolutionStatus: form.evolutionStatus || undefined,
      });
      onSuccess?.(exhibit);
    } catch {
      setError('The archive would not seal. Try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return Boolean(form.title && form.category);
      case 1: return Boolean(form.story);
      case 2: return Boolean(form.expectedOutcome && form.actualOutcome && form.lessonLearned);
      default: return true;
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24">
      <Header />

      <Progress current={step} />

      <div className="max-w-3xl mx-auto bg-paper border border-glass-edge rounded-lg p-8 md:p-12 mt-12">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {step === 0 && <StepFailure form={form} update={update} />}
              {step === 1 && <StepStory form={form} update={update} />}
              {step === 2 && <StepLesson form={form} update={update} />}
              {step === 3 && (
                <StepWeight
                  form={form}
                  update={update}
                  tagInput={tagInput}
                  setTagInput={setTagInput}
                  addTag={addTag}
                  removeTag={removeTag}
                  priorExhibits={priorExhibits}
                />
              )}
              {step === 4 && <StepReview form={form} error={error} />}
            </motion.div>
          </AnimatePresence>

          <Navigation
            step={step}
            setStep={setStep}
            canProceed={canProceed()}
            submitting={submitting}
            onSubmit={submit}
          />
        </form>
      </div>
    </div>
  );
}

// ---- Header --------------------------------------------------------------

function Header() {
  return (
    <header className="text-center max-w-[55ch] mx-auto space-y-4 mb-16">
      <Eyebrow tick={false} prefix="">{'// PRESERVE A FAILURE'}</Eyebrow>
      <h1 className="font-display text-[clamp(2.5rem,4vw,4rem)] leading-[1.05] tracking-tight text-ink">
        Preserve a failure.
      </h1>
      <p className="font-display italic text-[clamp(1.125rem,1.4vw,1.375rem)] leading-relaxed text-ink-muted">
        Your story deserves to be witnessed, not hidden.
      </p>
    </header>
  );
}

// ---- Progress ------------------------------------------------------------

function Progress({ current }: { current: number }) {
  return (
    <nav className="max-w-3xl mx-auto" aria-label="Form progress">
      <ol className="grid grid-cols-5 gap-3">
        {STEPS.map((s, i) => {
          const isCurrent = i === current;
          const isDone = i < current;
          return (
            <li key={s.label} className="flex flex-col gap-2 items-start">
              <span
                className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] ${
                  isCurrent
                    ? 'text-brass'
                    : isDone
                      ? 'text-ink-muted'
                      : 'text-whisper'
                }`}
              >
                {isCurrent && <span className="brass-tick" aria-hidden />}
                {s.num}
              </span>
              <span
                className={`font-sans text-[12px] ${
                  isCurrent
                    ? 'text-ink font-medium'
                    : isDone
                      ? 'text-ink-muted'
                      : 'text-whisper'
                }`}
              >
                {s.label}
              </span>
              <span
                className={`block w-full h-px mt-1 ${
                  isDone || isCurrent ? 'bg-brass' : 'bg-vellum'
                }`}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---- Step 1: The Failure -------------------------------------------------

interface StepProps {
  form: {
    title: string;
    category: string;
    story: string;
    expectedOutcome: string;
    actualOutcome: string;
    lessonLearned: string;
    emotionalState: string;
    painLevel: number;
    regretLevel: number;
    recoveryProgress: number;
    stillHurts: boolean;
    wouldRetry: boolean;
    endingStatus: string;
    recoveryStatus: string;
    visibilityMode: string;
    emotionalTags: string[];
    parentFailureId: string;
    evolutionStatus: string;
  };
  update: <K extends keyof StepProps['form']>(field: K, value: StepProps['form'][K]) => void;
}

function StepFailure({ form, update }: StepProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-[clamp(1.5rem,2vw,2rem)] leading-snug text-ink">
          Name the failure.
        </h2>
        <p className="font-sans text-[14px] text-ink-muted">
          What would you call this exhibit? Pick a category — it shapes the
          room it ends up in.
        </p>
      </div>

      <Input
        label="Exhibit title"
        placeholder="e.g. The shattered glass prototype"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
      />

      <div className="space-y-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper">
          Category
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <PickerButton
              key={cat.value}
              active={form.category === cat.value}
              onClick={() => update('category', cat.value)}
            >
              {cat.label}
            </PickerButton>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper">
          Visibility
        </span>
        <div className="flex flex-wrap gap-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <PickerButton
              key={opt.value}
              active={form.visibilityMode === opt.value}
              onClick={() => update('visibilityMode', opt.value)}
            >
              {opt.label}
            </PickerButton>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---- Step 2: The Story ---------------------------------------------------

function StepStory({ form, update }: StepProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-[clamp(1.5rem,2vw,2rem)] leading-snug text-ink">
          Tell the story.
        </h2>
        <p className="font-sans text-[14px] text-ink-muted">
          Be honest. The archive does not edit, sanitise, or compress.
        </p>
      </div>

      <Textarea
        label="The full story"
        placeholder="What happened? What led to this moment?"
        value={form.story}
        onChange={(e) => update('story', e.target.value)}
        rows={8}
      />

      <Input
        label="Emotional state (optional)"
        placeholder="What it felt like. A few words is enough."
        value={form.emotionalState}
        onChange={(e) => update('emotionalState', e.target.value)}
      />
    </motion.div>
  );
}

// ---- Step 3: The Lesson --------------------------------------------------

function StepLesson({ form, update }: StepProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-[clamp(1.5rem,2vw,2rem)] leading-snug text-ink">
          Expectation vs reality.
        </h2>
        <p className="font-sans text-[14px] text-ink-muted">
          The most painful gap is between what we imagined and what
          happened. Then — what it taught you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Textarea
          label="What you expected"
          placeholder="I believed that…"
          value={form.expectedOutcome}
          onChange={(e) => update('expectedOutcome', e.target.value)}
          rows={5}
        />
        <Textarea
          label="What actually happened"
          placeholder="But instead…"
          value={form.actualOutcome}
          onChange={(e) => update('actualOutcome', e.target.value)}
          rows={5}
        />
      </div>

      <Textarea
        label="The lesson — mortality report"
        placeholder="What did this experience teach you?"
        value={form.lessonLearned}
        onChange={(e) => update('lessonLearned', e.target.value)}
        rows={3}
      />
    </motion.div>
  );
}

// ---- Step 4: The Weight --------------------------------------------------

interface StepWeightProps extends StepProps {
  tagInput: string;
  setTagInput: (v: string) => void;
  addTag: () => void;
  removeTag: (t: string) => void;
  priorExhibits: { id: string; title: string }[];
}

function StepWeight({ form, update, tagInput, setTagInput, addTag, removeTag, priorExhibits }: StepWeightProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-[clamp(1.5rem,2vw,2rem)] leading-snug text-ink">
          The weight.
        </h2>
        <p className="font-sans text-[14px] text-ink-muted">
          How much did this affect you? These are private — they shape the
          archive's atmospheric tints, not a public score.
        </p>
      </div>

      <Slider
        label="Pain"
        min={1}
        max={10}
        value={form.painLevel}
        onChange={(v) => update('painLevel', v)}
        leftLabel="Bearable"
        rightLabel="Catastrophic"
      />
      <Slider
        label="Regret"
        min={1}
        max={10}
        value={form.regretLevel}
        onChange={(v) => update('regretLevel', v)}
      />
      <Slider
        label="Recovery progress"
        min={0}
        max={100}
        value={form.recoveryProgress}
        onChange={(v) => update('recoveryProgress', v)}
        suffix="%"
      />

      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <Checkbox
          label="Still hurts"
          checked={form.stillHurts}
          onChange={(c) => update('stillHurts', c)}
        />
        <Checkbox
          label="Would retry"
          checked={form.wouldRetry}
          onChange={(c) => update('wouldRetry', c)}
        />
      </div>

      <div className="space-y-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper">
          Ending status
        </span>
        <div className="grid grid-cols-1 gap-2">
          {ENDING_STATUSES.map((status) => (
            <PickerButton
              key={status.value}
              active={form.endingStatus === status.value}
              onClick={() => update('endingStatus', status.value)}
              alignLeft
            >
              <div className="font-display text-[1rem] leading-tight">{status.label}</div>
              <div className="font-sans text-[12px] text-ink-muted mt-0.5">{status.description}</div>
            </PickerButton>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper">
          Recovery status
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RECOVERY_STATUSES.map((status) => (
            <PickerButton
              key={status.value}
              active={form.recoveryStatus === status.value}
              onClick={() => update('recoveryStatus', status.value)}
            >
              {status.label}
            </PickerButton>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper">
          Evolution status (optional)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EVOLUTION_STATUSES.map((s) => (
            <PickerButton
              key={s.value}
              active={form.evolutionStatus === s.value}
              onClick={() => update('evolutionStatus', form.evolutionStatus === s.value ? '' : s.value)}
            >
              {s.label}
            </PickerButton>
          ))}
        </div>
      </div>

      {priorExhibits.length > 0 && (
        <div className="space-y-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper">
            Continues a previous attempt (optional)
          </span>
          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-auto no-scrollbar">
            <PickerButton active={!form.parentFailureId} onClick={() => update('parentFailureId', '')}>
              None — this is a first attempt
            </PickerButton>
            {priorExhibits.map((ex) => (
              <PickerButton
                key={ex.id}
                active={form.parentFailureId === ex.id}
                onClick={() => update('parentFailureId', ex.id)}
                alignLeft
              >
                {ex.title}
              </PickerButton>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper">
          Emotional tags
        </span>
        <div className="flex gap-2">
          <Input
            placeholder="add a tag (e.g. regret, burnout)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button variant="outline" size="sm" onClick={addTag}>
            Add
          </Button>
        </div>
        {form.emotionalTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {form.emotionalTags.map((tag) => (
              <Tag key={tag} interactive>
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-whisper hover:text-brass"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </Tag>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---- Step 5: Review ------------------------------------------------------

function StepReview({ form, error }: { form: StepProps['form']; error: string }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-[clamp(1.5rem,2vw,2rem)] leading-snug text-ink">
          Review and seal.
        </h2>
        <p className="font-sans text-[14px] text-ink-muted">
          This is what the archive will preserve. Nothing here is permanent
          — you can edit later from the detail page.
        </p>
      </div>

      <div className="bg-bone border border-glass-edge rounded-md p-6 md:p-8 space-y-6">
        <Field label="Title">
          <p className="font-display text-[1.5rem] leading-snug text-ink">
            {form.title || 'Untitled'}
          </p>
        </Field>
        <Field label="Category">
          <p className="font-mono text-[12px] text-ink">
            {CATEGORIES.find((c) => c.value === form.category)?.label || 'Not selected'}
          </p>
        </Field>
        <Field label="Story preview">
          <p className="font-sans text-[14px] leading-relaxed text-ink-muted line-clamp-3">
            {form.story || 'No story yet.'}
          </p>
        </Field>

        <EngravedDivider />

        <div className="grid grid-cols-3 gap-4">
          <Stat label="Pain" value={`${form.painLevel}/10`} />
          <Stat label="Regret" value={`${form.regretLevel}/10`} />
          <Stat label="Recovery" value={`${form.recoveryProgress}%`} />
        </div>

        <Field label="Visibility">
          <p className="font-mono text-[12px] text-ink capitalize">
            {form.visibilityMode.replace(/_/g, ' ')}
          </p>
        </Field>
      </div>

      {error && (
        <p className="font-mono text-[11px] tracking-tight text-rust">{error}</p>
      )}
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper">
        {label}
      </span>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-[1.5rem] text-brass">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-whisper mt-1">
        {label}
      </div>
    </div>
  );
}

// ---- Form controls ------------------------------------------------------

function PickerButton({
  active,
  onClick,
  children,
  alignLeft = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  alignLeft?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 border rounded-md transition-colors ${
        alignLeft ? 'text-left' : 'text-center'
      } ${
        active
          ? 'border-brass bg-brass-soft text-brass'
          : 'border-glass-edge text-ink-muted hover:border-brass/40 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span
        className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
          checked ? 'border-brass bg-brass' : 'border-glass-edge bg-paper'
        }`}
        aria-hidden
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="w-3 h-3 text-paper">
            <path
              d="M3 8.5L6.5 12L13 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
    </label>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
  leftLabel,
  rightLabel,
  suffix,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper">
          {label}
        </span>
        <span className="font-display text-[1.25rem] text-brass">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-px appearance-none bg-vellum cursor-pointer accent-brass"
      />
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-whisper">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}

// ---- Navigation ---------------------------------------------------------

function Navigation({
  step,
  setStep,
  canProceed,
  submitting,
  onSubmit,
}: {
  step: number;
  setStep: (s: number) => void;
  canProceed: boolean;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const isLast = step === STEPS.length - 1;
  return (
    <div className="pt-8 border-t border-glass-edge flex items-center justify-between">
      <button
        type="button"
        onClick={() => setStep(Math.max(0, step - 1))}
        disabled={step === 0}
        className="group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-brass disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Previous
      </button>

      {isLast ? (
        <Button
          variant="primary"
          size="md"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? 'Preserving…' : 'Preserve exhibit'}
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
          disabled={!canProceed}
        >
          Continue
        </Button>
      )}
    </div>
  );
}
