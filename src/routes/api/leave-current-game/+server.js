import { authenticate } from '$db/auth/authenticate';
import { Game } from '$db/models/Game';
import { json } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { UserGame } from '$db/models/UserGame';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ cookies }) {
  try {
    const auth = authenticate(cookies.get('auth-token'));
    if (!auth) return json({ success: false, message: 'Unauthorized' });

    const user = await UserGame.findById(new ObjectId(auth.id));
    if (!user) {
      return json({ success: false, message: 'User does not exist.' });
    }

    if (!user.currentGame) {
        return json({ success: true, message: 'You are not in a game.' });
    }

    const gameId = user.currentGame;
    const game = await Game.findById(gameId);

    user.currentGame = null;
    await user.save();

    if (!game) {
      return json({ success: true, message: 'Game not found. Left successfully.' });
    }

    game.users = game.users.filter(id => !id.equals(user._id));

    if (game.users.length === 0) {
      await game.deleteOne();
      console.log(`Deleted game ${game._id} after user left`);
    } else {
      await game.save();
    }

    return json({ success: true, message: 'Left game and updated game state.', disconnectSocket: true, gameId: gameId?.toString() });
  } catch (err) {
    return json({ success: false, message: err.message });
  }
}
