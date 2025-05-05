import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';
import { generateQuote } from '$db/GenerateQuote';
import { authenticate } from '$db/auth/authenticate';
import { UserAuth } from '$db/models/UserAuth';
import { ObjectId } from 'mongodb';
import { Game } from '$db/models/Game';
import { Cookies } from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export async function load({cookies, params}) {
    // console.log('Loading game with roomID:', params['roomID']);
    const auth = authenticate(cookies.get("auth-token"));
    if (!auth) {
       return redirect(307, '/');
    }

    try {
        const user = await UserAuth.findById(new ObjectId(auth['id']));
        if (!user) return redirect(307, '/');

        const game = await Game.findById(new ObjectId(params['roomID']));
        if (!game) return redirect(307, '/');

        if (user.currentGame != null && user.currentGame.toString() != game._id.toString())  return redirect(307, '/game/' + game._id);
        if (!game.users.includes(user._id)) return redirect(307, '/'); // already in game

        user.currentGame = game._id;
        await user.save();
        return {roomID: params['roomID']};
    } catch (error) {
        return redirect(307, '/')
    }
}