import cron from 'node-cron';
import { Game } from '../backend-utils/Game.js';
import { UserGame } from '../backend-utils/UserGame.js';

// Run daily at 8 AM UTC = 3 AM EST / 12 AM PST
cron.schedule('0 8 * * *', async () => {
  console.log('[CRON] Running daily cleanup of inactive games...');

  try {
    // 1. Delete games with no users
    const noUserGames = await Game.find({ users: { $size: 0 } });
    const noUserGameIds = noUserGames.map(g => g._id);

    if (noUserGameIds.length > 0) {
      await Game.deleteMany({ _id: { $in: noUserGameIds } });
      console.log(`[CRON] Deleted ${noUserGameIds.length} games with no users.`);
    }

    // 2. Delete games where all users have no currentSocketId
    const populatedGames = await Game.find({ users: { $not: { $size: 0 } } });

    let deletedCount = 0;

    for (const game of populatedGames) {
      const userIds = game.users; // These are ObjectIds
      const users = await UserGame.find({ _id: { $in: userIds } });

      const allDisconnected = users.every(user =>
        !user.currentSocketId || user.currentSocketId === ''
      );

      if (allDisconnected) {
        await Game.deleteOne({ _id: game._id });
        deletedCount++;

        await UserGame.updateMany(
          {
            _id: { $in: userIds },
            currentGame: game._id // Game._id is a string
          },
          { $set: { currentGame: null } }
        );

        console.log(`[CRON] Deleted inactive game ${game._id} and cleared currentGame for affected users.`);
      }
    }

    console.log(`[CRON] Finished cleanup. Deleted ${deletedCount} inactive games.`);
  } catch (err) {
    console.error('[CRON ERROR] Failed to clean up inactive games:', err);
  }
});