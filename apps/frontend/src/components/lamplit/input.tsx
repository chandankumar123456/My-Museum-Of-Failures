'use client';

import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

/**
 * Lamplit Archive — Input + Textarea primitives.
 *
 * Style: bottom-border-only. The brass focus underline animates in over 200ms.
 * Layout: label above, helper below, error inline below in muted red.
 * Never adds rounded corners or background fills — the input "writes onto" the
 * page itself, like a museum index card.
 */

interface BaseFieldProps {
  label?: string;
  helper?: string;
  error?: string;
}

type LamplitInputProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;
type LamplitTextareaProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

function FieldShell({
  id,
  label,
  helper,
  error,
  children,
}: {
  id: string;
  label?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-whisper"
        >
          {label}
        </label>
      )}

      {children}

      {error ? (
        <p className="font-mono text-[11px] tracking-tight text-rust mt-1">{error}</p>
      ) : helper ? (
        <p className="font-sans text-[12px] text-whisper mt-1">{helper}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, LamplitInputProps>(function Input(
  { label, helper, error, className = '', id, ...props },
  ref,
) {
  const reactId = useId();
  const fieldId = id || reactId;

  return (
    <FieldShell id={fieldId} label={label} helper={helper} error={error}>
      <input
        ref={ref}
        id={fieldId}
        className={[
          'archival-input',
          'font-sans text-[15px] text-ink placeholder:text-whisper',
          error ? 'border-b-rust focus:border-b-rust' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={helper || error ? `${fieldId}-desc` : undefined}
        {...props}
      />
    </FieldShell>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, LamplitTextareaProps>(function Textarea(
  { label, helper, error, className = '', id, rows = 5, ...props },
  ref,
) {
  const reactId = useId();
  const fieldId = id || reactId;

  return (
    <FieldShell id={fieldId} label={label} helper={helper} error={error}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={[
          'archival-input resize-none',
          'font-sans text-[15px] text-ink placeholder:text-whisper',
          'leading-relaxed',
          error ? 'border-b-rust focus:border-b-rust' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={Boolean(error) || undefined}
        {...props}
      />
    </FieldShell>
  );
});
