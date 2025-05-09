import { authenticate } from '$db/auth/authenticate';
import { json } from '@sveltejs/kit';
import { leaveGameCleanup } from '$db/leaveGameCleanup.js';

export async function POST({ cookies }) {
    const auth = authenticate(cookies.get('auth-token'));
    if (!auth) return json({ success: false, message: 'Unauthorized' });

    const result = await leaveGameCleanup(auth.id);
    return json({ ...result, disconnectSocket: true });
}