import redis from '../redis.js';

/**
 * Updates a user's score in all relevant Redis leaderboards after a game.
 * @param {string} username - The user's username.
 * @param {string} cipherType - The cipher type they just played.
 * @param {object} stats - The user's *new, updated* stats object for that cipher from MongoDB.
 * e.g., { elo: 1520, wins: 10, losses: 5, averageSolveTime: 2.5, bestSolveTime: 1.8 }
 */
export async function updateUserInLeaderboards(username, cipherType, stats) {
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