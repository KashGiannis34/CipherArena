import { Game } from './Game.js';
import { UserGame } from './UserGame.js';
import { ObjectId } from 'mongodb';

/**
 * Attempts to add a userGame to a game. Avoids refetching if already loaded.
 * @param {string} roomCode - The game ID
 * @param {string} userGameId - The UserGame ID
 * @param {Object} [opts]
 * @param {import('./UserGame.js').UserGameDoc} [opts.userGame] - Optional preloaded UserGame doc
 * @param {import('./Game.js').GameDoc} [opts.game] - Optional preloaded Game doc
 * @returns {{ success: boolean, message?: string, gameId?: string, leaveGame?: string }}
 */
export async function joinGame(roomCode, userGameId, { userGame = null, game = null } = {}) {
	try {
		if (!userGame) {
			userGame = await UserGame.findById(new ObjectId(userGameId));
			if (!userGame) return { success: false, message: 'Unauthorized' };
		}

		// Already in game
		if (userGame.currentGame && userGame.currentGame !== roomCode) {
			return {
				success: false,
				message: 'You are already in a game. Leave the current game before joining another.',
				leaveGame: userGame.currentGame
			};
		}

		if (!game) {
			game = await Game.findById(roomCode);
			if (!game) return { success: false, message: 'Game not found' };
		}

		// Game already started
		if (game.users.some(id => id.equals(userGame._id))) {
			if (!userGame.currentGame) {
				userGame.currentGame = game._id;
				await userGame.save();
			}
			return { success: true, gameId: game._id };
		}

		if (game.state != 'waiting') {
			return { success: false, message: 'Game has already started' };
		}

		// Room full
		if (game.users.length >= game.playerLimit) {
			return { success: false, message: 'Game has reached its player limit' };
		}

		game.users.push(userGame._id);
		await game.save();

		userGame.currentGame = game._id;
		await userGame.save();

		return { success: true, gameId: game._id };
	} catch (err) {
		console.error('joinGame error:', err);
		return { success: false, message: 'Invalid Code' };
	}
}
