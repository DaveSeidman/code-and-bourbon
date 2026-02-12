import { z } from 'zod';

/**
 * Zod schema for required server-only env vars.
 * Validates on first use and throws with clear messages if invalid.
 */
const serverEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().min(1, 'BETTER_AUTH_URL is required'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/**
 * Returns validated server env. Throws if any required var is missing or invalid.
 * Copy .env.example to .env and set values.
 */
export const getServerEnv = (): ServerEnv => {
  if (cached) return cached;
  const raw = {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    MONGO_URI: process.env.MONGO_URI,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };
  cached = serverEnvSchema.parse(raw);
  return cached;
};
