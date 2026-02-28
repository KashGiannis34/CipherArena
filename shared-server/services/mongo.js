const MONGO_URL = process.env.MONGO_URL;
import mongoose from 'mongoose';

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 120000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  bufferCommands: true,
};

export async function start_mongo() {
  try {
    const readyState = mongoose.connection.readyState;

    if (readyState !== 1) {
      console.log(`[mongo] Connection state: ${readyState}, attempting to connect...`);
      await mongoose.connect(MONGO_URL, clientOptions);
      console.log('[mongo] Connected to MongoDB.');
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection object is undefined after connect.');
    }

    await db.admin().command({ ping: 1 });
    console.log('[mongo] Connection verified with ping.');
  } catch (err) {
    console.error('[mongo] Connection error:', err?.stack ?? err);
    throw err; // Re-throw so caller knows about the failure
  }
}
