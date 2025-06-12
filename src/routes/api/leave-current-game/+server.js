import { authenticate } from '$dbutils/authenticate';
import { json } from '@sveltejs/kit';
import { leaveGameCleanup } from '$dbutils/leaveGameCleanup.js';

export async function POST({ cookies, request }) {
    const auth = authenticate(cookies.get('auth-token'));
    if (!auth) return json({ success: false, message: 'Unauthorized' });

    let gameId;
    try {
        const body = await request.json();
        gameId = body?.gameId;
    } catch {
        gameId = null;
    }

    const result = gameId
        ? await leaveGameCleanup(auth.id, gameId)
        : await leaveGameCleanup(auth.id);

    return json({ ...result, disconnectSocket: true });
}
