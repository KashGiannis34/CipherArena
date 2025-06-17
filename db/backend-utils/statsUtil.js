import { UserGame } from './UserGame.js';

export async function incrementTotal(userId, cipherType, returnUser = false) {
    const user = await UserGame.findById(userId);
    if (!user) return null;

    const typesToUpdate = [cipherType, 'All'];
    for (const type of typesToUpdate) {
        if (!user.singleplayerStats[type]) {
            user.singleplayerStats[type] = {
                wins: 0,
                total: 0,
                solveTimes: [],
                bestSolveTime: null,
                averageSolveTime: null
            };
        }
        user.singleplayerStats[type].total += 1;
    }

    console.log(user);

    await user.save();
    return returnUser ? user : null;
}

export async function incrementWin(userId, cipherType, solveTime, length, returnUser = false) {
    const user = await UserGame.findById(userId);
    if (!user) return null;

    const typesToUpdate = [cipherType, 'All'];
    for (const type of typesToUpdate) {
        if (!user.singleplayerStats[type]) {
            user.singleplayerStats[type] = {
                wins: 0,
                total: 0,
                solveTimes: [],
                bestSolveTime: null,
                averageSolveTime: null
            };
        }

        user.singleplayerStats[type].wins += 1;
        user.singleplayerStats[type].solveTimes.push({ time: solveTime, length });

        if (
            user.singleplayerStats[type].bestSolveTime === null ||
            solveTime < user.singleplayerStats[type].bestSolveTime
        ) {
            user.singleplayerStats[type].bestSolveTime = solveTime;
        }

        const totalPerChar = user.singleplayerStats[type].solveTimes.reduce(
            (acc, s) => acc + (s.time / s.length),
            0
        );
        user.singleplayerStats[type].averageSolveTime =
            totalPerChar / user.singleplayerStats[type].solveTimes.length;
    }

    await user.save();
    return returnUser ? user : null;
}