// src/routes/api/game-players/+server.js
import { Game } from '$db/models/Game';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const gameId = url.searchParams.get('gameId');
  const game = await Game.findById(gameId).populate('users');

  if (!game) return json([], { status: 404 });

  const players = await game.users.map(u => ({
    username: u.username,
    connected: u.currentSocketId ? true : false,
  }));

  return json(players);
}
