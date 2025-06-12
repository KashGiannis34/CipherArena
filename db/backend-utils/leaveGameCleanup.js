// src/db/game/leaveGameCleanup.js
import { Game } from './Game.js';
import { UserGame } from './UserGame.js';
import { ObjectId } from 'mongodb';

/**
 * Handles leaving a game, including DB cleanup
 * @param {ObjectId} userId
 * @returns {Promise<{ success: boolean, message: string, gameId?: string }>}
 */
export async function leaveGameCleanup(userId, gameId) {
    const user = await UserGame.findById(new ObjectId(userId));
    if (!user) return { success: false, message: 'User not found' };

    if (!gameId) {
        gameId = user.currentGame;
    }

    if (user.currentGame == gameId || !gameId) {
        user.currentGame = null;
        await user.save();
    }

    const game = await Game.findById(gameId).populate('users').exec();
    if (!game) return { success: true, message: 'Game not found', gameId: gameId };

    game.users = game.users.filter(id => !id.equals(user._id));

    if (game.users.length === 0) {
        await game.deleteOne();
        return { success: true, message: 'User left and game deleted', gameId: gameId };
    } else {
        if (game.host.equals(user._id)) {
            const newHost = game.users.find(u => u.currentSocketId != null);
            if (newHost) {
                game.host = newHost._id;
            }
        }
    }

    await game.save();

    return { success: true, message: 'User left and game updated', gameId: gameId };
}
