'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

/**
 * Lamplit Archive — Button.
 *
 * Variants:
 *   - primary   : brass fill, paper text. The CTA inside the archive.
 *   - secondary : ink outline 1px, transparent fill, ink text.
 *   - outline   : brass outline 1px, transparent fill, brass text.
 *   - ghost     : no border, brass underline on hover.
 *
 * The active state nudges -1px on the Y axis to give a tactile push feel.
 * Never use `rounded-full` here — pills are an anti-pattern in this system.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-brass text-paper border border-brass hover:bg-brass-deep hover:border-brass-deep',
  secondary:
    'bg-transparent text-ink border border-ink/70 hover:bg-ink hover:text-paper',
  outline:
    'bg-transparent text-brass border border-brass hover:bg-brass-soft',
  ghost:
    'bg-transparent text-ink border border-transparent hover:underline underline-offset-4 decoration-brass decoration-1',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-sans font-medium tracking-tight',
        'rounded-md transition-all duration-150',
        'active:translate-y-[1px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-bone',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
});
