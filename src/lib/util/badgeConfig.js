export const badgeCriteria = [
{
    id: 'elo_aristocrat_1500',
    label: 'Aristocrat Master',
    description: 'Reach 1500 Elo in Aristocrat.',
    check: stats => stats?.Aristocrat?.elo >= 1500
},
{
    id: 'elo_caesar_1400',
    label: 'Caesar Strategist',
    description: 'Reach 1400 Elo in Caesar.',
    check: stats => stats?.Caesar?.elo >= 1400
},
{
    id: 'wins_total_50',
    label: 'Competitor',
    description: 'Win 50 total ranked games.',
    check: stats => stats?.All?.wins >= 50
},
{
    id: 'wins_aristocrat_50',
    label: 'Aristocrat Victor',
    description: 'Win 50 Ranked Aristocrat games.',
    check: stats => stats?.Aristocrat?.wins >= 50
},
{
    id: 'elo_total_1300',
    label: 'Balanced Warrior',
    description: 'Reach 1300 average Elo across all cipher types.',
    check: stats => stats?.All?.elo >= 1300
},
{
    id: 'games_played_100',
    label: 'Veteran Solver',
    description: 'Play 100 total ranked games.',
    check: stats => {
    const allTypes = Object.keys(stats || {}).filter(t => t !== 'All');
    const total = allTypes.reduce((acc, type) => {
        const s = stats[type];
        return acc + (s?.wins || 0) + (s?.losses || 0);
    }, 0);
    return total >= 100;
    }
},
{
    id: 'games_played_34',
    label: 'Giannis Rookie',
    description: 'Play 34 total ranked games.',
    check: stats => {
        const types = Object.keys(stats || {}).filter(t => t !== 'All');
        const total = types.reduce((acc, type) => {
        const s = stats[type];
        return acc + (s?.wins || 0) + (s?.losses || 0);
        }, 0);
        return total >= 34;
    }
},
{
    id: 'wins_total_34',
    label: 'Greek Freak',
    description: 'Win 34 total ranked games.',
    check: stats => stats?.All?.wins >= 34
},
{
    id: 'elo_aristocrat_1340',
    label: 'Aristocrat Freak',
    description: 'Reach 1340 Elo in Aristocrat — no backing down.',
    check: stats => stats?.Aristocrat?.elo >= 1340
},
];

export function getUnlockedBadges(stats) {
  return badgeCriteria.filter(badge => badge.check(stats));
}