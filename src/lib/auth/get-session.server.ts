import { getRequest } from '@tanstack/react-start/server';

import { auth } from '~/lib/auth/auth.config';

/**
 * Server-only: get current session from request (cookies/headers). Use in protected server functions.
 */
export const getSession = async () => {
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
};
