import { redirect, error } from '@sveltejs/kit';
import { cipherTypes } from '$db/shared-utils/CipherTypes';
import { generateQuote } from '$dbutils/GenerateQuote';
import { authenticate } from '$dbutils/authenticate';
import { UserGame } from '$dbutils/UserGame';
import { ObjectId } from 'mongodb';
import { Game } from '$dbutils/Game';
import { joinGame } from '$db/joinGame';

/** @type {import('./$types').PageLoad} */
export async function load({cookies, params}) {
    const auth = authenticate(cookies.get("auth-token"));
    if (!auth) {
       return {action: "login", gameId: params.roomID};
    }

    try {
        const user = await UserGame.findById(new ObjectId(auth['id']));
        if (!user) return {action: "login", gameId: params.roomID};

        const game = await Game.findById(params.roomID);
        if (!game) {
            throw error(404, {
                message: 'Game not found'
            });
        }

        if (user.currentGame != null && user.currentGame != game._id)  {
            return {"action":"leaveGame","currentGame": user.currentGame, gameId: params.roomID};
        }

        if (user.currentGame == game._id && game.users.includes(user._id)) {
            throw redirect(302, `/game/${params.roomID}`);
        } else {
            const result = await joinGame(params.roomID, user._id, { userGame: user, game });
            if (!result.success) {
                throw error(400, {
                    message: `Could not join the game: ${result.message}`
                });
            }
            throw redirect(302, `/game/${params.roomID}`);
        }
    } catch (e) {
        // If it's already a SvelteKit error, rethrow it
        if (e?.status) throw e;

        // Otherwise, wrap it in a 500 error
        console.error('Error handling auth:', e);
        throw error(500, {
            message: 'An unexpected error occurred while joining the game'
        });
    }
}