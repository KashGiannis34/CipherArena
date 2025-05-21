import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';
import { generateQuote } from '$db/GenerateQuote';
import { authenticate } from '$db/auth/authenticate';
import { UserGame } from '$db/models/UserGame';
import { ObjectId } from 'mongodb';
import { Game } from '$db/models/Game';
import { Cookies } from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export async function load({cookies, params}) {
    // console.log('Loading game with roomID:', params['roomID']);
    const auth = authenticate(cookies.get("auth-token"));
    if (!auth) {
       return redirect(303, '/');
    }

    try {
        const user = await UserGame.findById(new ObjectId(auth.id));
        if (!user) return redirect(303, '/');

        const game = await Game.findById(params.roomID);
        if (!game) return redirect(303, '/private-lobby');

        if (user.currentGame != game._id || !game.users.includes(user._id)) {
            return redirect(303, '/private-lobby');
        } else {
            console.log('Game state in DB:', game.state);
            return {roomID: game._id, authToken: cookies.get("auth-token"), state: game.state};
        }
    } catch (error) {
        console.error('Error loading game:', error);
        return redirect(303, '/');
    }
}