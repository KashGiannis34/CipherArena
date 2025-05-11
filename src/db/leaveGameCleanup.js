// src/db/game/leaveGameCleanup.js
import { Game } from './models/Game';
import { UserGame } from './models/UserGame';
import { ObjectId } from 'mongodb';

/**
 * Handles leaving a game, including DB cleanup
 * @param {ObjectId} userId
 * @returns {Promise<{ success: boolean, message: string, gameId?: string }>}
 */
export async function leaveGameCleanup(userId) {
    const user = await UserGame.findById(new ObjectId(userId));
    if (!user) return { success: false, message: 'User not found' };

    const gameId = user.currentGame;
    user.currentGame = null;
    await user.save();

    const game = await Game.findById(gameId).populate('users').exec();
    if (!game) return { success: true, message: 'Game not found', gameId: gameId?.toString() };

    game.users = game.users.filter(id => !id.equals(user._id));

    if (game.users.length === 0) {
        await game.deleteOne();
        console.log(`Deleted game ${game._id} after user left`);
        return { success: true, message: 'User left and game deleted', gameId: gameId?.toString() };
    } else {
        if (game.host.equals(user._id)) {
            const newHost = game.users.find(u => u.currentSocketId != null);
            if (newHost) {
                game.host = newHost._id;
                console.log(`🔁 Host transferred to ${newHost._id.toString()}`);
            } else {
                console.log(`🟡 No replacement host found (all players disconnected)`);
            }
        }
    }

    await game.save();

    return { success: true, message: 'User left and game updated', gameId: gameId?.toString() };
}
