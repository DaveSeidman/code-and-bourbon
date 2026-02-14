import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

import { getServerEnv } from '~/env/server-env.server';
import { getClient, getDb } from '~/lib/db/db.server';

const env = getServerEnv();
const db = getDb();
const client = getClient();

const hasGoogleOAuth =
  Boolean(env.GOOGLE_CLIENT_ID?.trim()) && Boolean(env.GOOGLE_CLIENT_SECRET?.trim());

/**
 * Better Auth instance: MongoDB adapter, TanStack Start cookie handling.
 * Google OAuth is enabled only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set (e.g. in production).
 */
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, { client }),
  ...(hasGoogleOAuth && {
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
      },
    },
  }),
  plugins: [tanstackStartCookies()],
});
