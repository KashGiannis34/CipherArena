import { redirect, error } from '@sveltejs/kit';
import { authenticate } from '$utils/authenticate';
import { UserGame } from '$game/UserGame';
import { ObjectId } from 'mongodb';
import { Game } from '$game/Game';

/** @type {import('./$types').PageLoad} */
export async function load({cookies}) {
    const auth = authenticate(cookies.get("auth-token"));
    if (!auth) {
        throw error(401, {
            message: 'You must be logged in to access the lobby'
        });
    }

    try {
        const user = await UserGame.findById(new ObjectId(auth.id));
        if (!user) {
            throw error(401, {
                message: 'Invalid user account'
            });
        }

        return {authToken: cookies.get("auth-token")};
    } catch (e) {
        if (e?.status) throw e;

        console.error('Error loading lobby:', e);
        throw error(500, {
            message: 'An unexpected error occurred while loading the lobby'
        });
    }
}