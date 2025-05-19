import { Quote } from '../src/db/models/Quote.js';
import { ObjectId } from 'mongodb';
import { encodeQuote, stripQuote } from '../src/lib/util/CipherUtil.js';

export function calculateElo(players, winnerUsername, cipherType, K = 32, eloFloor = 100) {
  const eloChanges = {};

  // Fallback if someone doesn't have a rating
  const getElo = (p) => {
    if (p.eloRatings instanceof Map) {
      return p.eloRatings.get(cipherType) ?? 1200;
    } else if (typeof p.eloRatings === 'object') {
      return p.eloRatings[cipherType] ?? 1200;
    }
    return 1200;
  };

  const ratings = players.map(p => ({
    username: p.username,
    elo: getElo(p),
    power: 10 ** (getElo(p) / 400)
  }));

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

export async function updateEloAfterWin(game, winner, cipherType) {
  const eloChanges = calculateElo(game.users, winner.username, cipherType);

  for (const player of game.users) {
    const delta = eloChanges[player.username] ?? 0;

    if (!player.eloRatings.has(cipherType)) {
      player.eloRatings.set(cipherType, 1200);
    }

    const current = player.eloRatings.get(cipherType);
    player.eloRatings.set(cipherType, Math.max(current + delta, 100));
    await player.save();
  }

  return eloChanges; // 🎯 Now returns the changes instead of emitting anything
}

