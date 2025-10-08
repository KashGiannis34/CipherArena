import { json } from '@sveltejs/kit';
import { getStats } from '$db/botService';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const stats = getStats();
		return json(stats);
	} catch (error) {
		console.error('Error getting bot stats:', error);
		return json({
			error: 'Failed to get stats',
			details: error.message
		}, { status: 500 });
	}
}
