import { redirect, error } from '@sveltejs/kit';
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
        throw error(401, {
            message: 'You must be logged in to access this game'
        });
    }

    try {
        const user = await UserGame.findById(new ObjectId(auth.id));
        if (!user) {
            throw error(401, {
                message: 'Invalid user account'
            });
        }

        const game = await Game.findById(params.roomID);
        if (!game) {
            throw error(404, {
                message: 'Game not found'
            });
        }

        if (user.currentGame != game._id || !game.users.includes(user._id)) {
            throw error(403, {
                message: 'You are not a member of this game'
            });
        } else {
            return {roomID: game._id, authToken: cookies.get("auth-token"), state: game.state,
                mode: game.mode, autoFocus: game.autoFocus, playerLimit: game.playerLimit,
                cipherType: game.params.cipherType, K: game.params.K, solve: game.params.solve};
        }
    } catch (e) {
        // If it's already a SvelteKit error, rethrow it
        if (e?.status) throw e;

        // Otherwise, wrap it in a 500 error
        console.error('Error loading game:', e);
        throw error(500, {
            message: 'An unexpected error occurred while loading the game'
        });
    }
}