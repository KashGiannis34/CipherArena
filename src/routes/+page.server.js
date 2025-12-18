import redis from '$services/redis.js';
import { UserGame } from '$game/UserGame.js';

const USER_COUNT_KEY = 'total_user_count';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	const username = cookies.get('username') || 'HelloKitty34';
	let userCount = 0;

	try {
		const cachedCount = await redis.get(USER_COUNT_KEY);

		if (cachedCount) {
			userCount = parseInt(cachedCount, 10);
		} else {
			const dbCount = await UserGame.countDocuments({});
			userCount = dbCount;

			await redis.set(USER_COUNT_KEY, userCount);
		}
	} catch (error) {
		console.error('Failed to retrieve user count:', error);
		userCount = 0;
	}

	return { username, userCount };
}