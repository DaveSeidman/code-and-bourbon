import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import type { SignupStatus } from '~/lib/db/types';
import { getSession } from '~/lib/auth/get-session.server';
import { ensureMongooseConnected } from '~/lib/db/db.server';
import { SignupModel } from '~/lib/db/models/Signup.model';

/** Zod schema for server function input: event id. */
const eventIdSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
});

/** Zod schema for signup status: -1 (no), 0 (maybe), 1 (yes). */
const signupStatusSchema = z.union([z.literal(-1), z.literal(0), z.literal(1)]);

/** Zod schema for saveSignup input. */
const saveSignupSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  status: signupStatusSchema,
});

/**
 * Server function: get current user's signup for an event. Returns null if not logged in or no signup.
 */
export const getSignup = createServerFn({ method: 'GET' })
  .inputValidator(eventIdSchema)
  .handler(async ({ data }): Promise<{ status: SignupStatus } | null> => {
    const session = await getSession();
    if (session?.user.id == null) return null;
    const { eventId } = data;
    await ensureMongooseConnected();
    const doc = await SignupModel.findOne({
      userId: session.user.id,
      eventId,
    }).lean();
    if (doc == null) return null;
    return { status: doc.status };
  });

/**
 * Server function: upsert current user's signup for an event. Requires auth.
 */
export const saveSignup = createServerFn({ method: 'POST' })
  .inputValidator(saveSignupSchema)
  .handler(async ({ data }): Promise<{ status: SignupStatus }> => {
    const session = await getSession();
    const userId = session?.user.id;
    if (userId == null) {
      throw new Error('Unauthorized');
    }
    const { eventId, status } = data;
    await ensureMongooseConnected();
    await SignupModel.findOneAndUpdate(
      { userId, eventId },
      { userId, eventId, status },
      { upsert: true, new: true },
    );
    return { status };
  });
