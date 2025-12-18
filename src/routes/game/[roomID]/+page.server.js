import { redirect, error } from '@sveltejs/kit';
import { cipherTypes } from '$shared/CipherTypes';
import { generateQuote } from '$game/generateQuote';
import { authenticate } from '$utils/authenticate';
import { UserGame } from '$game/UserGame';
import { ObjectId } from 'mongodb';
import { Game } from '$game/Game';

/** @type {import('./$types').PageLoad} */
export async function load({cookies, params}) {
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
        if (e?.status) throw e;

        console.error('Error loading game:', e);
        throw error(500, {
            message: 'An unexpected error occurred while loading the game'
        });
    }
}