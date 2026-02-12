import mongoose, { Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const eventSchema = new Schema(
  {
    date: { type: String, required: true },
    location: {
      name: { type: String, required: true },
      neighborhood: { type: String, required: true },
      map: { type: String, required: true },
    },
    theme: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

/** Schema-derived type (plain object, no _id in inference). */
export type EventSchemaType = InferSchemaType<typeof eventSchema>;

/** Location subdocument type derived from schema. */
export type EventLocation = EventSchemaType['location'];

/** API/response type: schema fields with _id as string. */
export type Event = EventSchemaType & { _id: string };

export const EventModel =
  mongoose.models.Event ?? mongoose.model('Event', eventSchema);
