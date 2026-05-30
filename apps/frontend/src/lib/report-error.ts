/**
 * Central client-side error reporter. Logs structured errors today; swap the
 * body for `Sentry.captureException(error, { extra: context })` once a DSN is
 * configured. Keeping every boundary routed through here means one change
 * wires up the whole app.
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };
  console.error('[report]', payload);
}
