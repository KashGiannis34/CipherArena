import { MONGO_URL } from "$env/static/private";
import { mongoose } from 'mongoose'

const clientOptions = {serverApi: { version: '1', strict: true, deprecationErrors: true } };
export async function start_mongo() {
  try {
    if (!mongoose.connection.readyState == 1) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(MONGO_URL, clientOptions);
      console.log("MongoDB connected!");
    }

    // Ensure the `db` object is ready
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection is not initialized");
    }

    await db.admin().command({ ping: 1 });
    console.log("MongoDB connection verified with ping!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}