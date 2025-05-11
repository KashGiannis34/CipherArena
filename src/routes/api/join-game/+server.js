import { joinGame } from '$db/joinGame';
import { json } from '@sveltejs/kit';
import { authenticate } from '$db/auth/authenticate';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, cookies }) {
    const req = await request.json();
    const auth = authenticate(cookies.get("auth-token"));
    const result = await joinGame(req.roomCode, auth.id);
    return json(result);
}
