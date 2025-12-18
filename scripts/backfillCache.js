import 'dotenv/config';
import mongoose from 'mongoose';
import Redis from 'ioredis';

import { UserGame } from '../shared-server/game/UserGame.js';
import { updateUserInLeaderboards } from '../shared-server/utils/leaderboard.js';

const USER_COUNT_KEY = 'total_user_count';

const clientOptions = {
	serverApi: { version: '1', strict: true, deprecationErrors: true},
};

async function runBackfill() {
    console.log('Starting cache backfill script...');

    console.log('Connecting to MongoDB and Redis...');
    try {
        await mongoose.connect(process.env.MONGO_URL, clientOptions);

        const redis = new Redis(process.env.REDIS_URL);
        console.log('Connections successful.');

        console.log('\nFetching all users for leaderboard backfill...');
        const allUsers = await UserGame.find({}).lean();
        console.log(`Found ${allUsers.length} users to process.`);

        let processedCount = 0;
        for (const user of allUsers) {
            if (user.stats) {
                for (const cipherType in user.stats) {
                    const stats = user.stats[cipherType];
                    await updateUserInLeaderboards(redis, user.username, cipherType, stats);
                }
            }
            processedCount++;
            console.log(`[${processedCount}/${allUsers.length}] Processed leaderboards for user: ${user.username}`);
        }
        console.log('Leaderboards backfilled successfully.');

        console.log('\nFetching total user count from MongoDB...');
        const userCount = await UserGame.countDocuments({});
        console.log(`Found ${userCount} registered users.`);

        await redis.set(USER_COUNT_KEY, userCount);
        console.log(`Set '${USER_COUNT_KEY}' in Redis to ${userCount}.`);
        console.log('\n Backfill complete!');

        await mongoose.disconnect();
        redis.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('An error occurred during the backfill:', error);
        process.exit(1);
    }
}

runBackfill();