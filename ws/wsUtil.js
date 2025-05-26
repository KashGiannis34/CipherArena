import { Quote } from '../src/db/models/Quote.js';
import { ObjectId } from 'mongodb';
import { encodeQuote, stripQuote } from '../src/lib/util/CipherUtil.js';
import { UserGame } from '../src/db/models/UserGame.js';

export function calculateElo(players, winnerUsername, cipherType, K = 32, eloFloor = 100) {
  const eloChanges = {};

  const getElo = (player) => player.eloRatings?.[cipherType] ?? 1200;

  const ratings = players.map(p => {
    const elo = getElo(p);
    return {
      username: p.username,
      elo,
      power: 10 ** (elo / 400)
    };
  });

  const totalPower = ratings.reduce((sum, r) => sum + r.power, 0);

  for (const player of ratings) {
    const expected = player.power / totalPower;
    const actual = player.username === winnerUsername ? 1 : 0;
    const delta = Math.round(K * (actual - expected));

    const newElo = player.elo + delta;
    const finalDelta = newElo < eloFloor ? eloFloor - player.elo : delta;

    eloChanges[player.username] = finalDelta;
  }

  return eloChanges;
}

export async function checkAnswerCorrectness(ans, quoteId, cipherType, keys, solve) {
  if (ans.includes(' ')) return false;

  const quote = await Quote.findById(new ObjectId(quoteId));
  if (!quote) return false;

  let ansText = stripQuote(quote.text);
  if (solve === 'Encode') {
    ansText = encodeQuote(ansText, cipherType, keys);
  }

  return ans === ansText;
}

export async function updateEloAfterWin(gameUsers, winner, cipherType) {
  const eloChanges = calculateElo(gameUsers, winner.username, cipherType);

  for (const player of gameUsers) {
    const delta = eloChanges[player.username] ?? 0;

    // Ensure eloRatings exists
    if (!player.eloRatings || typeof player.eloRatings !== 'object') {
      player.eloRatings = {};
    }

    const currentElo = player.eloRatings[cipherType] ?? 1200;
    player.eloRatings[cipherType] = Math.max(currentElo + delta, 100);

    player.markModified('eloRatings'); // Needed because it's a nested object
    await player.save();
  }

  return eloChanges;
}