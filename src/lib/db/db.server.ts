import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

import { getServerEnv } from '~/env/server-env.server';

// Native driver: used by Better Auth adapter (sync getDb/getClient required at module load).
let client: MongoClient | null = null;

export const getClient = (): MongoClient => {
  if (!client) {
    const { MONGO_URI } = getServerEnv();
    client = new MongoClient(MONGO_URI);
  }
  return client;
};

export const getDb = () => getClient().db();

// Mongoose: used by Event and Signup models. Connect on first use.
let mongoosePromise: Promise<typeof mongoose> | null = null;

/**
 * Ensures Mongoose is connected. Call once at the start of server functions that use models.
 */
export const ensureMongooseConnected = async (): Promise<void> => {
  if (mongoosePromise == null) {
    const { MONGO_URI } = getServerEnv();
    mongoosePromise = mongoose.connect(MONGO_URI);
  }
  await mongoosePromise;
};
