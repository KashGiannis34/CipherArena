import { Game } from '$game/Game';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const gameId = url.searchParams.get('gameId');
  const game = await Game.findById(gameId).populate('users');

  if (!game) return json([], { status: 404 });

  const players = await game.users.map(u => ({
    username: u.username,
    connected: u.currentSocketId ? true : false,
    host: game.host.equals(u._id),
    elo: u.stats?.[game.params.cipherType]?.elo ?? 1000,
    profilePicture: u.profilePicture
  }));

  return json(players);
}
