import { Quote } from '../src/db/models/Quote.js';
import { ObjectId } from 'mongodb';
import { encodeQuote, stripQuote } from '../src/lib/util/CipherUtil.js';
import { UserGame } from '../src/db/models/UserGame.js';
import { cipherTypes } from '../src/lib/util/CipherTypes.js';

export function calculateElo(players, winnerUsername, cipherType, K = 32, eloFloor = 100) {
  const eloChanges = {};

  const getElo = (player) => player.stats?.[cipherType]?.elo ?? 1000;

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

function updateTotalStats(user, solveTime) {
  let totalElo = 0, totalWins = 0, totalLosses = 0;
  let count = 0;

  for (const type of Object.keys(cipherTypes)) {
    const s = user.stats?.[type];
    if (!s) continue;

    totalElo += s.elo ?? 1000;
    totalWins += s.wins ?? 0;
    totalLosses += s.losses ?? 0;
    count++;
  }

  const avgElo = count > 0 ? Math.round(totalElo / count) : 1000;
  const allStats = user.stats.All ?? {};
  allStats.elo = avgElo;
  allStats.wins = totalWins;
  allStats.losses = totalLosses;

  if (solveTime != undefined) {
    allStats.solveTimes ??= [];
    allStats.solveTimes.push(solveTime);

    allStats.bestSolveTime = Math.min(allStats.bestSolveTime ?? solveTime, solveTime);
    allStats.averageSolveTime = Math.round(allStats.solveTimes.reduce((a, b) => a + b, 0) / allStats.solveTimes.length);
  }

  user.stats.All = allStats;
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

export async function updateStatsAfterWin(gameUsers, winner, cipherType, solveTime) {
  const eloChanges = calculateElo(gameUsers, winner.username, cipherType);

  for (const player of gameUsers) {
    const delta = eloChanges[player.username] ?? 0;

    if (!player.stats) player.stats = {};
    if (!player.stats[cipherType]) {
      player.stats[cipherType] = { elo: 1000, wins: 0, losses: 0, solveTimes: [] };
    }

    const stats = player.stats[cipherType];
    stats.elo = Math.max(stats.elo + delta, 100);

    if (player.username === winner.username) {
      stats.wins += 1;
      stats.solveTimes ??= [];
      stats.solveTimes.push(solveTime);

      stats.bestSolveTime = Math.min(stats.bestSolveTime ?? solveTime, solveTime);
      stats.averageSolveTime = Math.round(stats.solveTimes.reduce((a, b) => a + b, 0) / stats.solveTimes.length);

      updateTotalStats(player, solveTime);
    } else {
      stats.losses += 1;
      updateTotalStats(player);
    }

    player.markModified('stats');
    player.markModified('stats.All');
    await player.save();
  }

  return eloChanges;
}