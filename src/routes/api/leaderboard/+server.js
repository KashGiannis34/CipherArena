import redis from '$db/redis.js';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const cipherType = url.searchParams.get('cipherType');
    let metric = url.searchParams.get('metric');
    const count = parseInt(url.searchParams.get('count') ?? '50', 10);

    if (metric === 'avg solve time per char') metric = 'avgSolveTime';
    if (metric === 'best solve time') metric = 'bestSolveTime';

    const validMetrics = ['elo', 'wins', 'winPercent', 'avgSolveTime', 'bestSolveTime'];
    if (!cipherType || !metric || !validMetrics.includes(metric)) {
        return json({ error: 'Invalid query parameters.' }, { status: 400 });
    }

    const leaderboardKey = `leaderboard:${cipherType}:${metric}`;
    const limit = Math.min(count, 50) - 1;

    try {
        let results;
        if (metric === 'avgSolveTime' || metric === 'bestSolveTime') {
            results = await redis.zrange(leaderboardKey, 0, limit, 'WITHSCORES');
        } else {
            results = await redis.zrevrange(leaderboardKey, 0, limit, 'WITHSCORES');
        }

        const leaderboard = [];
        for (let i = 0; i < results.length; i += 2) {
            leaderboard.push({
                username: results[i],
                value: parseFloat(results[i + 1])
            });
        }

        return json(leaderboard);

    } catch (err) {
        console.error('Leaderboard fetch error:', err);
        return json({ error: 'Internal server error.' }, { status: 500 });
    }
}