import { cipherTypes } from "../shared/CipherTypes.js";
/**
 * Updates a user's score and trims the leaderboard to the top 50.
 * @param {string} username - The user's username.
 * @param {string} cipherType - The cipher type they just played.
 * @param {object} stats - The user's new, updated stats object for that cipher.
 */
export async function updateUserInLeaderboards(redis, username, cipherType, stats) {
    if (!username || !cipherType || !stats) return;

    const pipe = redis.pipeline();

    const eloKey = `leaderboard:${cipherType}:elo`;
    pipe.zadd(eloKey, stats.elo, username);

    const winsKey = `leaderboard:${cipherType}:wins`;
    pipe.zadd(winsKey, stats.wins, username);

    const winPercentKey = `leaderboard:${cipherType}:winPercent`;
    const totalGames = stats.wins + stats.losses;
    if (totalGames >= 10) {
        const winPct = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
        pipe.zadd(winPercentKey, winPct.toFixed(4), username);
    } else {
        pipe.zrem(winPercentKey, username);
    }

    const avgTimeKey = `leaderboard:${cipherType}:avgSolveTime`;
    if (stats.wins >= 5 && stats.averageSolveTime > 0) {
        pipe.zadd(avgTimeKey, stats.averageSolveTime, username);
    }

    const bestTimeKey = `leaderboard:${cipherType}:bestSolveTime`;
    if (stats.bestSolveTime > 0 && stats.bestSolveTime < Number.MAX_SAFE_INTEGER) {
        pipe.zadd(bestTimeKey, stats.bestSolveTime, username);
    }

    await pipe.exec();
}

/**
 * Removes a user from all Redis leaderboards upon account deletion.
 * @param {string} username - The username of the user to remove.
 */
export async function removeUserFromLeaderboards(redis, username) {
    if (!username) return;

    const pipe = redis.pipeline();
    const metrics = ['elo', 'wins', 'winPercent', 'avgSolveTime', 'bestSolveTime'];
    const allCipherKeys = ['All', ...Object.keys(cipherTypes)];

    for (const cipher of allCipherKeys) {
        for (const metric of metrics) {
            const leaderboardKey = `leaderboard:${cipher}:${metric}`;
            pipe.zrem(leaderboardKey, username);
        }
    }

    await pipe.exec();
}
