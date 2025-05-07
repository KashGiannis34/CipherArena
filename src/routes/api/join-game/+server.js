import { authenticate } from '$db/auth/authenticate';
import { Game } from '$db/models/Game';
import { json } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { UserGame } from '$db/models/UserGame';
import { UserAuth } from '$db/models/UserAuth';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, cookies }) {
    try {
        const { roomCode } = await request.json();
        const auth = authenticate(cookies.get("auth-token"));

        if (!auth) return json({ success: false, message: "Unauthorized" });

        const userGame = await UserGame.findById(new ObjectId(auth.id));
        if (!userGame) return json({ success: false, message: "Unauthorized" });

        if (userGame.currentGame && userGame.currentGame.toString() !== roomCode) {
            return json({
                success: false,
                message: "You are already in a game. Leave the current game before joining another.",
                leaveGame: userGame.currentGame.toString()
            });
        }

        const game = await Game.findById(roomCode);
        if (!game) {
            return json({ success: false, message: "Game not found" });
        }

        if (game.users.length >= 2 && !game.users.some(id => id.equals(userGame._id))) {
            return json({ success: false, message: "Game is full" });
        }

        if (game.users.some(id => id.equals(userGame._id))) {
            return json({ success: true, gameId: game._id.toString() });
        }

        game.users.push(userGame._id);
        await game.save();

        userGame.currentGame = game._id;
        await userGame.save();

        return json({ success: true, gameId: game._id.toString() });
    } catch (error) {
        return json({ success: false, message: error.message || "Failed to join game" });
    }
}
