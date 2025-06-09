import { redirect, error } from '@sveltejs/kit';
import { authenticate } from '$db/auth/authenticate';
import { UserGame } from '$db/models/UserGame';
import { ObjectId } from 'mongodb';
import { Game } from '$db/models/Game';
import { Cookies } from "@sveltejs/kit";

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
        // If it's already a SvelteKit error, rethrow it
        if (e?.status) throw e;

        // Otherwise, wrap it in a 500 error
        console.error('Error loading lobby:', e);
        throw error(500, {
            message: 'An unexpected error occurred while loading the lobby'
        });
    }
}