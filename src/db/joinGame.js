import { Game } from '$db/models/Game';
import { UserGame } from '$db/models/UserGame';
import { ObjectId } from 'mongodb';

/**
 * Attempts to add a userGame to a game. Avoids refetching if already loaded.
 * @param {string} roomCode - The game ID
 * @param {string} userGameId - The UserGame ID
 * @param {Object} [opts]
 * @param {import('$db/models/UserGame').UserGameDoc} [opts.userGame] - Optional preloaded UserGame doc
 * @param {import('$db/models/Game').GameDoc} [opts.game] - Optional preloaded Game doc
 * @returns {{ success: boolean, message?: string, gameId?: string, leaveGame?: string }}
 */
export async function joinGame(roomCode, userGameId, { userGame = null, game = null } = {}) {
	try {
		// Use provided documents or fetch
		if (!userGame) {
			userGame = await UserGame.findById(new ObjectId(userGameId));
			if (!userGame) return { success: false, message: 'Unauthorized' };
		}

		if (userGame.currentGame && userGame.currentGame.toString() !== roomCode) {
			return {
				success: false,
				message: 'You are already in a game. Leave the current game before joining another.',
				leaveGame: userGame.currentGame.toString()
			};
		}

		if (!game) {
			game = await Game.findById(new ObjectId(roomCode));
			if (!game) return { success: false, message: 'Game not found' };
		}

		// Already in game
		if (game.users.some(id => id.equals(userGame._id))) {
			if (!userGame.currentGame) {
				userGame.currentGame = game._id;
				await userGame.save();
			}
			return { success: true, gameId: game._id.toString() };
		}

		// Room full
		if (game.users.length >= 2) {
			return { success: false, message: 'Game is full' };
		}

		game.users.push(userGame._id);
		await game.save();

		userGame.currentGame = game._id;
		await userGame.save();

		return { success: true, gameId: game._id.toString() };
	} catch (err) {
		console.error('joinGame error:', err);
		return { success: false, message: 'Invalid Code' };
	}
}
