import { z } from 'zod';

const appUrlSchema = z
  .string()
  .min(1, 'VITE_APP_URL is required. Copy .env.example to .env and set it.');

/**
 * Client-side: app base URL from env. Validates with Zod and throws if missing.
 */
export const getAppUrl = (): string => {
  const url = import.meta.env.VITE_APP_URL;
  return appUrlSchema.parse(url ?? '');
};
