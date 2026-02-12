import { createAuthClient } from 'better-auth/react';

import { getAppUrl } from '~/env/env';

/**
 * Single Better Auth client for the app. baseURL from env (no hardcoded URLs).
 * Use authClient.useSession(), authClient.signIn.social(), authClient.signOut() in components.
 */
export const authClient = createAuthClient({
  baseURL: getAppUrl(),
});
