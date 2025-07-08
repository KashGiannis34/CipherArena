const MONGO_URL = process.env.MONGO_URL;
import mongoose from 'mongoose';

const clientOptions = {
	serverApi: { version: '1', strict: true, deprecationErrors: true},
};

export async function start_mongo() {
	try {
		if (mongoose.connection.readyState !== 1) {
			console.log("[mongo] Connecting to MongoDB...");
			await mongoose.connect(MONGO_URL, clientOptions);
			console.log("[mongo] Connected to MongoDB.");
		} else {
			console.log("[mongo] Already connected.");
		}

		const db = mongoose.connection.db;
		if (!db) {
			throw new Error("Database connection object is undefined after connect.");
		}

		await db.admin().command({ ping: 1 });
		console.log("[mongo] Connection verified with ping.");
	} catch (err) {
		console.error("[mongo] Connection error:", err?.stack ?? err);
	}
}