'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/report-error';

/**
 * Root error boundary. Replaces the whole document (including the layout)
 * when an error escapes the root layout, so it must render its own
 * <html>/<body> and cannot rely on globals.css — styles are inline with the
 * Lamplit palette (bone canvas, ink text, brass accent).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: 'global', digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F4EFE6',
          color: '#171514',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          textAlign: 'center',
          padding: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '40ch' }}>
          <h1 style={{ fontSize: '1.75rem', fontStyle: 'italic', margin: '0 0 0.75rem' }}>
            The archive is temporarily closed.
          </h1>
          <p style={{ color: '#5C534A', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            A critical error interrupted the museum. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              cursor: 'pointer',
              border: '1px solid #A8794B',
              background: '#A8794B',
              color: '#FBF7EE',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
