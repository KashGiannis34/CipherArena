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
    pipe.zremrangebyrank(eloKey, 0, -51);

    const winsKey = `leaderboard:${cipherType}:wins`;
    pipe.zadd(winsKey, stats.wins, username);
    pipe.zremrangebyrank(winsKey, 0, -51);

    const winPercentKey = `leaderboard:${cipherType}:winPercent`;
    const totalGames = stats.wins + stats.losses;
    if (totalGames >= 10) {
        const winPct = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
        pipe.zadd(winPercentKey, winPct.toFixed(4), username);
        pipe.zremrangebyrank(winPercentKey, 0, -51);
    } else {
        pipe.zrem(winPercentKey, username);
    }

    const avgTimeKey = `leaderboard:${cipherType}:avgSolveTime`;
    if (stats.wins >= 5 && stats.averageSolveTime > 0) {
        pipe.zadd(avgTimeKey, stats.averageSolveTime, username);
        pipe.zremrangebyrank(avgTimeKey, 50, -1);
    }

    const bestTimeKey = `leaderboard:${cipherType}:bestSolveTime`;
    if (stats.bestSolveTime > 0 && stats.bestSolveTime < Number.MAX_SAFE_INTEGER) {
        pipe.zadd(bestTimeKey, stats.bestSolveTime, username);
        pipe.zremrangebyrank(bestTimeKey, 50, -1);
    }

    await pipe.exec();
}