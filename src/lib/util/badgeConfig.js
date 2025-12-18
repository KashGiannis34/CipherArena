import { cipherTypes } from '$shared/CipherTypes.js';

export const badgeCriteria = [
  {
    id: 'elo_aristocrat_1500',
    label: 'Aristocrat Master',
    description: 'Reach 1500 Elo in Aristocrat.',
    progress: stats => {
      const elo = stats?.Aristocrat?.elo ?? 1000;
      return elo >= 1500 ? undefined : `${elo}/1500 elo`;
    }
  },
  {
    id: 'elo_caesar_1400',
    label: 'Caesar Strategist',
    description: 'Reach 1400 Elo in Caesar.',
    progress: stats => {
      const elo = stats?.Caesar?.elo ?? 1000;
      return elo >= 1400 ? undefined : `${elo}/1400 elo`;
    }
  },
  {
    id: 'wins_total_50',
    label: 'Competitor',
    description: 'Win 50 total ranked games.',
    progress: stats => {
      const wins = stats?.All?.wins ?? 0;
      return wins >= 50 ? undefined : `${wins}/50 wins`;
    }
  },
  {
    id: 'wins_aristocrat_50',
    label: 'Aristocrat Victor',
    description: 'Win 50 Ranked Aristocrat games.',
    progress: stats => {
      const wins = stats?.Aristocrat?.wins ?? 0;
      return wins >= 50 ? undefined : `${wins}/50 wins`;
    }
  },
  {
    id: 'elo_total_1300',
    label: 'Balanced Warrior',
    description: 'Reach 1300 average Elo across all cipher types.',
    progress: stats => {
      const elo = stats?.All?.elo ?? 1000;
      return elo >= 1300 ? undefined : `${elo}/1300 elo`;
    }
  },
  {
    id: 'games_played_100',
    label: 'Veteran Solver',
    description: 'Play 100 total ranked games.',
    progress: stats => {
      const total = Object.entries(stats || {})
        .filter(([k]) => k !== 'All')
        .reduce((acc, [, s]) => acc + (s?.wins || 0) + (s?.losses || 0), 0);
      return total >= 100 ? undefined : `${total}/100 games`;
    }
  },
  {
    id: 'games_played_34',
    label: 'Giannis Rookie',
    description: 'Play 34 total ranked games.',
    progress: stats => {
      const total = Object.entries(stats || {})
        .filter(([k]) => k !== 'All')
        .reduce((acc, [, s]) => acc + (s?.wins || 0) + (s?.losses || 0), 0);
      return total >= 34 ? undefined : `${total}/34 games`;
    }
  },
  {
    id: 'wins_total_34',
    label: 'Greek Freak',
    description: 'Win 34 total ranked games.',
    progress: stats => {
      const wins = stats?.All?.wins ?? 0;
      return wins >= 34 ? undefined : `${wins}/34 wins`;
    }
  },
  {
    id: 'elo_aristocrat_1340',
    label: 'Aristocrat Freak',
    description: 'Reach 1340 Elo in Aristocrat. No backing down.',
    progress: stats => {
      const elo = stats?.Aristocrat?.elo ?? 1000;
      return elo >= 1340 ? undefined : `${elo}/1340 elo`;
    }
  },
  {
    id: 'fast_solver_10s',
    label: 'Lightning Solver',
    description: 'Solve any cipher in under 10 seconds.',
    progress: (stats, singleStats) => {
      const times = [
        ...(stats?.All?.solveTimes ?? []),
        ...(singleStats?.All?.solveTimes ?? [])
      ];
      if (times.some(t => t.time < 10)) return undefined;
      if (times.length === 0) return 'No solves yet';
      const closest = Math.min(...times.map(t => t.time));
      return `${closest}s (need < 10s)`;
    }
  },
  {
    id: 'under_30s_25x',
    label: 'Quick Thinker',
    description: 'Solve 25 ciphers in under 30 seconds.',
    progress: (stats, singleStats) => {
      const times = [
        ...(stats?.All?.solveTimes ?? []),
        ...(singleStats?.All?.solveTimes ?? [])
      ];
      const count = times.filter(t => t.time < 30).length;
      return count >= 25 ? undefined : `${count}/25 solves`;
    }
  },
  {
    id: 'under_60s_50x',
    label: 'Speed Demon',
    description: 'Solve 50 ciphers in under 60 seconds.',
    progress: (stats, singleStats) => {
      const times = [
        ...(stats?.All?.solveTimes ?? []),
        ...(singleStats?.All?.solveTimes ?? [])
      ];
      const count = times.filter(t => t.time < 60).length;
      return count >= 50 ? undefined : `${count}/50 solves`;
    }
  },
  {
    id: 'under_34s_34x_aristocrat',
    label: 'Freaky Fast Aristocrat',
    description: 'Solve 34 Aristocrat ciphers in under 34 seconds.',
    progress: (stats, singleStats) => {
      const times = [
        ...(stats?.Aristocrat?.solveTimes ?? []),
        ...(singleStats?.Aristocrat?.solveTimes ?? [])
      ];
      const count = times.filter(t => t.time < 34).length;
      return count >= 34 ? undefined : `${count}/34 solves`;
    }
  },
  {
    id: 'close_call_59',
    label: 'Close Call',
    description: 'Solve a cipher in exactly 59 seconds.',
    progress: (stats, singleStats) => {
      const times = [
        ...(stats?.All?.solveTimes ?? []),
        ...(singleStats?.All?.solveTimes ?? [])
      ];
      if (times.some(t => Math.round(t.time) === 59)) return undefined;
      if (times.length === 0) return 'No solves yet';
      const closest = times.reduce((prev, curr) =>
        Math.abs(curr.time - 59) < Math.abs(prev.time - 59) ? curr : prev, times[0]);
      return `${closest.time}s (need exactly 59s)`;
    }
  },
  {
    id: 'slow_grinder',
    label: 'Slow and Steady',
    description: 'Solve a cipher that took over 5 minutes.',
    progress: (stats, singleStats) => {
      const times = [
        ...(stats?.All?.solveTimes ?? []),
        ...(singleStats?.All?.solveTimes ?? [])
      ];

      if (times.some(t => t.time >= 300)) return undefined;
      if (times.length === 0) return 'No solves yet';
      const longest = Math.max(...times.map(t => t.time));
      return `${longest}s (need ≥ 300s)`;
    }
  },
  {
    id: 'prime_times_under_60',
    label: 'Prime Time Sniper',
    description: 'Solve at least one cipher in every 2-digit prime number of seconds (11–59).',
    progress: (stats, singleStats) => {
      const times = [
        ...(stats?.All?.solveTimes ?? []),
        ...(singleStats?.All?.solveTimes ?? [])
      ];
      const requiredPrimes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];
      const timeSet = new Set(times.map(t => Math.round(t.time)));
      const found = requiredPrimes.filter(p => timeSet.has(p));
      return found.length === requiredPrimes.length ? undefined : `${found.length}/13 primes hit`;
    }
  }
];

export function getUnlockedBadges(stats, singleStats) {
  return badgeCriteria.filter(b => b.progress(stats, singleStats) === undefined);
}
