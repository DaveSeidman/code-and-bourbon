import { createFileRoute } from '@tanstack/react-router';

import { auth } from '~/lib/auth/auth.config';

/**
 * Server route: forwards all /api/auth/* requests to Better Auth (OAuth, session, sign-out, etc.).
 */
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => auth.handler(request),
      POST: async ({ request }) => auth.handler(request),
    },
  },
});
