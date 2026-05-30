'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { AuthBootstrap } from './auth/auth-bootstrap';
import { SmoothScroll } from './smooth-scroll';
import { ScrollProgress } from './scroll-progress';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthBootstrap />
        <SmoothScroll />
        <ScrollProgress />
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            // Lamplit Archive — paper card with hairline edge, ink text,
            // mono accents. Keep visual restraint; toasts are interruptions.
            style: {
              background: '#FBF7EE',
              border: '1px solid rgba(23, 21, 20, 0.08)',
              color: '#171514',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9375rem',
              boxShadow: '0 6px 24px rgba(23, 21, 20, 0.06)',
            },
            classNames: {
              title: 'font-medium',
              description: 'text-[--color-ink-muted]',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
