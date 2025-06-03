import { UserGame } from '$db/models/UserGame';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const cipherType = url.searchParams.get('cipherType');
	const metric = url.searchParams.get('metric');

	if (!cipherType || !metric || !['elo', 'wins', 'winPercent', 'avg solve time', 'best solve time'].includes(metric)) {
		return json({ error: 'Invalid query parameters.' }, { status: 400 });
	}

	try {
		if (metric === 'winPercent') {
            const users = await UserGame.find(
                {
                    $expr: {
                        $gte: [
                            {
                                $add: [
                                    { $getField: { field: 'wins', input: { $getField: { field: cipherType, input: '$stats' } } } },
                                    { $getField: { field: 'losses', input: { $getField: { field: cipherType, input: '$stats' } } } }
                                ]
                            },
                            1
                        ]
                    }
                },
                {
                    username: 1,
                    [`stats.${cipherType}.wins`]: 1,
                    [`stats.${cipherType}.losses`]: 1
                }
            ).lean();

            const leaderboard = users
                .map(user => {
                    const stats = user.stats?.[cipherType] ?? { wins: 0, losses: 0 };
                    const total = stats.wins + stats.losses;
                    const winPct = total === 0 ? 0 : stats.wins / total;
                    return {
                        username: user.username,
                        value: parseFloat((winPct * 100).toFixed(2))
                    };
                })
                .sort((a, b) => b.value - a.value)
                .slice(0, 50);

            return json(leaderboard);
        } else if (metric == 'elo' || metric == 'wins') {
            // For "elo" and "wins"
            const users = await UserGame.find(
                { [`stats.${cipherType}.${metric}`]: { $exists: true } },
                {
                    username: 1,
                    [`stats.${cipherType}.${metric}`]: 1
                }
            )
                .sort({ [`stats.${cipherType}.${metric}`]: -1 })
                .limit(50)
                .lean();

            const leaderboard = users.map((user, index) => ({
                username: user.username,
                value: user.stats?.[cipherType]?.[metric] ?? 0
            }));

            return json(leaderboard);
        } else if (metric === 'avg solve time') {
            const leaderboard = await UserGame.aggregate([
                {
                    $match: {
                        [`stats.${cipherType}.wins`]: { $gte: 1 },
                        [`stats.${cipherType}.averageSolveTime`]: { $gt: 0 }
                    }
                },
                {
                    $project: {
                        username: 1,
                        value: `$stats.${cipherType}.averageSolveTime`
                    }
                },
                { $sort: { value: 1 } },
                { $limit: 50 }
            ]);

            return json(leaderboard);
        } else {
            const leaderboard = await UserGame.aggregate([
                {
                    $match: {
                        [`stats.${cipherType}.bestSolveTime`]: { $gt: 0, $lt: Number.MAX_SAFE_INTEGER }
                    }
                },
                {
                    $project: {
                        username: 1,
                        value: `$stats.${cipherType}.bestSolveTime`
                    }
                },
                { $sort: { value: 1 } },
                { $limit: 50 }
            ]);

            return json(leaderboard);
        }
	} catch (err) {
		console.error('Leaderboard fetch error:', err);
		return json({ error: 'Internal server error.' }, { status: 500 });
	}
}