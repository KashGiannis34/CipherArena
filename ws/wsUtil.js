import { getQuoteModel } from '../db/backend-utils/getQuoteModel.js';
import { ObjectId } from 'mongodb';
import { encodeQuote, stripQuote } from '../db/shared-utils/CipherUtil.js';
import { UserGame } from '../db/backend-utils/UserGame.js';
import { cipherTypes } from '../db/shared-utils/CipherTypes.js';
import { updateUserInLeaderboards } from '../db/backend-utils/leaderboard.js';

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

function updateTotalStats(user, solveTime, length) {
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
    allStats.solveTimes.push({ time: solveTime, length });

    const times = allStats.solveTimes.map(e => e.time);
    const timesPerLength = allStats.solveTimes.map(e => (e.time / e.length));
    allStats.bestSolveTime = Math.min(...times);
    allStats.averageSolveTime = timesPerLength.reduce((a, b) => a + b, 0) / timesPerLength.length;
  }

  user.stats.All = allStats;
}

export async function checkAnswerCorrectness(ans, quoteId, cipherType, keys, solve) {
  if (ans.includes(' ')) return false;

  const QuoteModel = getQuoteModel(cipherType);

  const quote = await QuoteModel.findById(new ObjectId(quoteId));
  if (!quote) return false;
  let displayText = quote.text;

  let ansText = stripQuote(quote.text, cipherType == 'Xenocrypt');
  if (solve === 'Encode') {
    ansText = encodeQuote(ansText, cipherType, keys).join('');
    displayText = ansText;
  }

  if (ans === ansText) {
    return { correct: true, text: displayText };
  } else {
    return { correct: false };
  }
}

export async function getQuote(quoteId, cipherType, keys, solve) {
  const QuoteModel = getQuoteModel(cipherType);
  const quote = await QuoteModel.findById(new ObjectId(quoteId));
  if (!quote) return '';
  let displayText = quote.text;

  if (solve === 'Encode') {
    let ansText = stripQuote(quote.text, cipherType == 'Xenocrypt');
    displayText = encodeQuote(ansText, cipherType, keys).join('');
  }

  return displayText;
}

export async function updateStatsAfterWin(redis, gameUsers, winner, cipherType, solveTime, length) {
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
      stats.solveTimes.push({ time: solveTime, length });

      const times = stats.solveTimes.map(e => e.time);
      const timesPerLength = stats.solveTimes.map(e => (e.time / e.length));
      stats.bestSolveTime = Math.min(...times);
      stats.averageSolveTime = timesPerLength.reduce((a, b) => a + b, 0) / timesPerLength.length;

      updateTotalStats(player, solveTime, length);
    } else {
      stats.losses += 1;
      updateTotalStats(player);
    }

    player.markModified('stats');
    player.markModified('stats.All');
    await player.save();

    try {
      await updateUserInLeaderboards(redis, player.username, cipherType, player.stats[cipherType]);

      if (player.stats.All) {
          await updateUserInLeaderboards(player.username, 'All', player.stats.All);
      }
    } catch (redisError) {
      console.error('CRITICAL: Failed to update leaderboards in Redis for user:', player.username, redisError);
    }
  }

  return eloChanges;
}