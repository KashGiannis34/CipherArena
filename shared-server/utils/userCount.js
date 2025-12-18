import redis from '../services/redis.js';

const USER_COUNT_KEY = 'total_user_count';

/**
 * Increments the total user count in Redis.
 */
export async function incrementUserCount() {
    try {
        await redis.incr(USER_COUNT_KEY);
    } catch (err) {
        console.error('Failed to increment user count in Redis:', err);
    }
}

/**
 * Decrements the total user count in Redis.
 */
export async function decrementUserCount() {
    try {
        await redis.decr(USER_COUNT_KEY);
    } catch (err) {
        console.error('Failed to decrement user count in Redis:', err);
    }
}
