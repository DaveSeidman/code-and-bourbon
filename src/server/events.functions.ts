import { createServerFn } from '@tanstack/react-start';
import { notFound } from '@tanstack/react-router';
import { z } from 'zod';

import type { Event } from '~/lib/db/types';
import { ensureMongooseConnected } from '~/lib/db/db.server';
import { EventModel } from '~/lib/db/models/Event.model';

/** Zod schema for server function input: event id. */
const eventIdSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
});

const toEvent = (doc: { _id: unknown; [key: string]: unknown }): Event => ({
  ...doc,
  _id: String(doc._id),
} as Event);

/**
 * Server function: fetch all events (no auth). Returns list sorted by client.
 */
export const getEvents = createServerFn({ method: 'GET' }).handler(async (): Promise<Array<Event>> => {
  await ensureMongooseConnected();
  const list = await EventModel.find().lean();
  return list.map(toEvent);
});

/**
 * Server function: fetch a single event by id. Throws notFound() if missing.
 */
export const getEventById = createServerFn({ method: 'GET' })
  .inputValidator(eventIdSchema)
  .handler(async ({ data }): Promise<Event> => {
    const { eventId } = data;
    await ensureMongooseConnected();
    const doc = await EventModel.findById(eventId).lean();
    if (doc == null) throw notFound();
    return toEvent(doc);
  });
