import { redirect } from '@sveltejs/kit';
import { cipherTypes } from '$lib/util/CipherTypes';
import { generateQuote } from '$db/GenerateQuote';
import { authenticate } from '$db/auth/authenticate';
import { UserGame } from '$db/models/UserGame';
import { ObjectId } from 'mongodb';
import { Game } from '$db/models/Game';
import { Cookies } from "@sveltejs/kit";
import { joinGame } from '$db/joinGame';

/** @type {import('./$types').PageLoad} */
export async function load({cookies, params}) {
    const auth = authenticate(cookies.get("auth-token"));
    if (!auth) {
       return {action: "login", gameId: params.roomID};
    }

    let redir = "";

    try {
        const user = await UserGame.findById(new ObjectId(auth['id']));
        if (!user) return {action: "login", gameId: params.roomID};

        const game = await Game.findById(params.roomID);
        if (!game) {
            return {
                action: "redirect",
                reason: "Game not found.",
                destination: "/"
            };
        }; // game not found

        if (user.currentGame != null && user.currentGame != game._id)  {
            return {"action":"leaveGame","currentGame": user.currentGame, gameId: params.roomID}; // leave game
        }

        if (user.currentGame == game._id && game.users.includes(user._id)) {
            return {
                action: "redirect",
                destination: `/game/${params.roomID}`
            };
        } else {
            const result = await joinGame(params.roomID, user._id, { userGame: user, game });
            if (!result.success) {
                return {
                    action: "redirect",
                    reason: "Could not join the game: " + result.message,
                    destination: "/private-lobby"
                };
            } else {
                return {
                    action: "redirect",
                    destination: `/game/${params.roomID}`
                };
            }
        }
    } catch (error) {
        console.error('Error handling auth:', error);
        return {action: "login", gameId: params.roomID};
    }
}