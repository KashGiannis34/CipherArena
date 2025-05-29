import { Quote } from '../src/db/models/Quote.js';
import { ObjectId } from 'mongodb';
import { encodeQuote, stripQuote } from '../src/lib/util/CipherUtil.js';
import { UserGame } from '../src/db/models/UserGame.js';
import { cipherTypes } from '../src/lib/util/CipherTypes.js';

export function calculateElo(players, winnerUsername, cipherType, K = 32, eloFloor = 100) {
  const eloChanges = {};

  const getElo = (player) => player.stats?.[cipherType]?.elo ?? 1200;

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

function updateTotalStats(user) {
  let totalElo = 0, totalWins = 0, totalLosses = 0;
  let count = 0;

  for (const type of Object.keys(cipherTypes)) {
    const s = user.stats?.[type];
    if (!s) continue;

    const elo = s.elo ?? 1200;
    const wins = s.wins ?? 0;
    const losses = s.losses ?? 0;

    totalElo += elo;
    totalWins += wins;
    totalLosses += losses;
    count++;
  }

  const avgElo = count > 0 ? Math.round(totalElo / count) : 1200;

  user.stats.All = {
    elo: Number.isFinite(avgElo) ? avgElo : 1200,
    wins: Number.isFinite(totalWins) ? totalWins : 0,
    losses: Number.isFinite(totalLosses) ? totalLosses : 0
  };
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

export async function updateStatsAfterWin(gameUsers, winner, cipherType) {
  const eloChanges = calculateElo(gameUsers, winner.username, cipherType);

  for (const player of gameUsers) {
    const delta = eloChanges[player.username] ?? 0;

    if (!player.stats) {
      player.stats = {};
    }

    if (!player.stats[cipherType]) {
      player.stats[cipherType] = { elo: 1200, wins: 0, losses: 0 };
    }

    const currentElo = player.stats[cipherType].elo;
    player.stats[cipherType].elo = Math.max(currentElo + delta, 100);

    // Update wins/losses
    if (player.username === winner.username) {
      player.stats[cipherType].wins += 1;
    } else {
      player.stats[cipherType].losses += 1;
    }

    updateTotalStats(player);

    player.markModified('stats'); // nested path
    player.markModified('stats.All');
    await player.save();
  }

  return eloChanges;
}