// src/routes/api/game-players/+server.js
import { Game } from '$db/models/Game';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const gameId = url.searchParams.get('gameId');
  const game = await Game.findById(gameId).populate('users');

  if (!game) return json([], { status: 404 });

  const players = game.users.map(u => ({
    username: u.username,
  }));

  return json(players);
}
