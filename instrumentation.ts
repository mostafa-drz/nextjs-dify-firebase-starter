import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Initialize Sentry for server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  // Initialize Sentry for edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Error handling for Next.js 15+ App Router
export const onRequestError = Sentry.captureRequestError;