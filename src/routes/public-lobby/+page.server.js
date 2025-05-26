import { redirect } from '@sveltejs/kit';
import { authenticate } from '$db/auth/authenticate';
import { UserGame } from '$db/models/UserGame';
import { ObjectId } from 'mongodb';
import { Game } from '$db/models/Game';
import { Cookies } from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export async function load({cookies}) {
    // console.log('Loading game with roomID:', params['roomID']);
    const auth = authenticate(cookies.get("auth-token"));
    if (!auth) {
       return redirect(303, '/');
    }

    try {
        const user = await UserGame.findById(new ObjectId(auth.id));
        if (!user) return redirect(303, '/');

        return {authToken: cookies.get("auth-token")};
    } catch (error) {
        console.error('Error loading lobby:', error);
        return redirect(303, '/');
    }
}