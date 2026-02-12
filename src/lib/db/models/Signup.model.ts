import mongoose, { Schema } from 'mongoose';
import type { InferSchemaType } from 'mongoose';

const signupSchema = new Schema(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
    status: { type: Number, enum: [-1, 0, 1] as const, required: true },
  },
  { timestamps: true },
);

signupSchema.index({ userId: 1, eventId: 1 }, { unique: true });

/** Schema-derived type (plain object). */
export type SignupSchemaType = InferSchemaType<typeof signupSchema>;

/** Status values from schema enum. */
export type SignupStatus = SignupSchemaType['status'];

/** API/response type. */
export type Signup = SignupSchemaType;

export const SignupModel = mongoose.model('Signup', signupSchema);
