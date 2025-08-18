import { Server } from 'socket.io';
import { Game } from '../db/backend-utils/Game.js';
import { encodeQuote, stripQuote } from '../db/shared-utils/CipherUtil.js';
import { ObjectId } from 'mongodb';
import { authenticate } from '../db/backend-utils/authenticate.js';
import { UserGame } from '../db/backend-utils/UserGame.js';
import { leaveGameCleanup } from '../db/backend-utils/leaveGameCleanup.js';
import socketIORateLimiter from '@d3vision/socket.io-rate-limiter';
import * as wsUtil from './wsUtil.js';
import { generateQuote } from '../db/backend-utils/GenerateQuote.js';
import { incrementTotal, incrementWin } from '../db/backend-utils/statsUtil.js';
import 'dotenv/config';


export default async function injectSocketIO(server) {

    const io = new Server(server.httpServer, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true
        }
    });
    globalThis.io = io;
    const activeSockets = new Map(); // userId → socketId
    const lobbySockets = new Map(); // userId → socketId
    const rematchVotesMap = new Map(); // gameId → Set of usernames who requested rematch
    const forfeitVotesMap = new Map(); // gameId → Set of usernames who gave up

    io.use(async (socket, next) => {
        // Authenticate socket before allowing connection
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("No token"));
        }

        const auth = authenticate(token); // runs jwt.verify
        if (auth == undefined) {
            console.log("No AUTH");
            return next(new Error("Invalid token"));
        }

        const user = await UserGame.findById(auth.id);
        if (!user) {
            return next(new Error('Unauthorized'));
        }

        socket.userId = auth.id;
        return next();
    });

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        const socketId = socket.id;
        let user;
        let game;
        let oldSocketId;

        socket.use(
            socketIORateLimiter({ proxy: true, maxBurst: 5, perSecond: 2, gracePeriodInSeconds: 5, emitClientHtmlError: true }, socket)
        );

        if (!socket.handshake.auth.joinLobby) {
            try {
                const existingSocketId = activeSockets.get(userId);
                if (existingSocketId && existingSocketId !== socketId) {
                    const existingSocket = io.sockets.sockets.get(existingSocketId);
                    if (existingSocket) {
                        existingSocket.disconnectReason = 'replaced';
                        existingSocket.disconnect();
                    }
                }
                activeSockets.set(userId, socketId);

                user = await UserGame.findById(new ObjectId(userId));

                if (user.currentGame) {
                    game = await Game.findById(user.currentGame).populate('users').exec();
                    if (!game) {
                        user.currentGame = null;
                        await user.save();
                        socket.emit('error', 'Your game no longer exists. You have been disconnected.');
                        socket.disconnectReason = 'invalid-game';
                        socket.disconnect();
                    }
                } else {
                    socket.emit('error', 'Your game no longer exists. You have been disconnected.');
                    socket.disconnectReason = 'invalid-game';
                    socket.disconnect();
                }
            } catch (_) {}
        } else {
            try {
                user = await UserGame.findById(new ObjectId(userId));
                oldSocketId = lobbySockets.get(userId);

                if (oldSocketId && oldSocketId !== socketId) {
                    const oldSocket = io.sockets.sockets.get(oldSocketId);
                    if (oldSocket) {
                        oldSocket.disconnectReason = 'replaced';
                        oldSocket.disconnect();
                    }
                }

                socket.join('public-lobby');
                socket.currentRoom = 'public-lobby';

                lobbySockets.set(userId, socketId);
            } catch (_) { }
        }

        // Update the user's active socket in the DB
        if (user && socket.currentRoom != 'public-lobby') {
            user.currentSocketId = socketId;
            await user.save();
        }


        if (socket.currentRoom != 'public-lobby') {
            if (game?.state) {
                io.to(socketId).emit('ready', game.state);
            } else {
                io.to(socketId).emit('ready');
            }

            socket.on('join-room', async () => {
                try {
                    const hostUG = await UserGame.findById(game.host);
                    if (!hostUG || !hostUG.currentSocketId) {
                        // Reassign host to the reconnecting user
                        await Game.findByIdAndUpdate(user.currentGame, { host: userId });
                    }

                    if (!game.users.some(u => u._id.equals(user._id))) {
                        return socket.emit('error', 'You are not allowed to join this game.');
                    }

                    socket.join(game._id);
                    socket.currentRoom = game._id;
                    io.to(game._id).emit('players-changed');
                    if (game.state == 'waiting') {
                        io.to('public-lobby').emit('lobbies-updated');
                    }

                    const forfeitSet = forfeitVotesMap.get(game._id);
                    if (forfeitSet && forfeitSet.has(user.username)) {
                        forfeitSet.delete(user.username);
                        io.to(game._id).emit('forfeit-votes', Array.from(forfeitSet));
                    }

                    const rematchSet = rematchVotesMap.get(game._id);
                    if (rematchSet?.has(user.username)) {
                        rematchSet.delete(user.username);
                        io.to(game._id).emit('rematch-votes', Array.from(rematchSet));
                    }
                } catch (_) { }
            });

            socket.on('leave-room', () => {
                socket.disconnectReason = 'leftGame';
                if (game._id && rematchVotesMap.has(game._id)) {
                    rematchVotesMap.delete(game._id);
                    io.to(game._id).emit('rematch-votes', []);
                }

                if (game._id && forfeitVotesMap.has(game._id)) {
                    forfeitVotesMap.delete(game._id);
                    io.to(game._id).emit('rematch-votes', []);
                }
            });

            socket.on('kick-player', async ({ username }) => {
                try {
                    game = await Game.findById(user.currentGame).populate('users').exec();
                    if (!game.host.equals(user._id)) {
                        socket.emit('error', 'Only the host can kick players');
                    }

                    const targetUser = game.users.find(user => user.username == username);
                    if (!targetUser) {
                        socket.emit('error', 'That player is not in your game');
                    }
                    if (targetUser._id.equals(user._id)) socket.emit('error', 'You cannot kick yourself');

                    // 1. Run DB cleanup
                    await leaveGameCleanup(targetUser._id, game._id);

                    // 2. Kick active socket
                    const targetSocket = io.sockets.sockets.get(activeSockets.get(targetUser._id.toString()));
                    if (targetSocket) {
                        targetSocket.disconnectReason = 'kicked';
                        targetSocket.emit('kicked');
                        targetSocket.disconnect();
                    }

                    // 3. Notify room
                    io.to(socket.currentRoom).emit('players-changed');
                    io.to('public-lobby').emit('lobbies-updated');
                } catch (err) {
                    socket.emit('error', 'Internal error during kick');
                }
            });

            socket.on('start-game', async () => {
                try {
                    game = await Game.findById(user.currentGame).populate('users').exec();

                    if (game.state != 'waiting') {
                        socket.emit('error', 'The game is not in the waiting state, please refresh the page');
                        return;
                    }

                    if (!game.host.equals(user._id)) {
                        socket.emit('error', 'Only the host can start the game');
                        return;
                    }

                    const toRemove = game.users.filter(u => !u.currentSocketId);
                    for (const user of toRemove) {
                        await leaveGameCleanup(user._id, game._id);
                    }

                    if (toRemove.length > 0) {
                        game = await Game.findById(game._id).populate('users').exec();
                    }

                    // If it's really just a singleplayer game, count it toward singleplayer total
                    if (game.mode === 'ranked' && game.users.length === 1 && user._id.equals(game.users[0]._id)) {
                        const cipherType = game.params.cipherType;
                        user = await incrementTotal(user._id, cipherType, true);
                    }

                    game.state = 'started';
                    game.metadata = {
                        initialUserIds: game.users,
                        startedAt: new Date()
                    };

                    await game.save();

                    io.to(socket.currentRoom).emit('start-game', game.params, game.autoFocus, game.quote);
                    io.to('public-lobby').emit('lobbies-updated');
                } catch (_) { }
            });

            socket.on('get-cipher-info', async (cb) => {
                try {
                    game = await Game.findById(user.currentGame);
                    if (!game.state == 'started') {
                        socket.emit('error', 'Game has not started yet');
                    } else {
                        cb({params: game.params, autoFocus: game.autoFocus, quote: game.quote});
                    }
                } catch (_) { }
            });

            socket.on('get-initial-players', async cb => {
                try {
                    game = await Game.findById(user.currentGame).populate('users').exec();
                    if (!game?.metadata?.initialUserIds) return cb([]);

                    const initialPlayers = await UserGame.find({ _id: { $in: game.metadata.initialUserIds } });

                    const formatted = initialPlayers.map(u => ({
                        username: u.username,
                        profilePicture: u.profilePicture,
                        elo: u.stats?.[game.params.cipherType]?.elo ?? 1000,
                        host: game.host.equals(u._id),
                        connected: !!u.currentSocketId,
                        left: !u.currentSocketId
                    }));

                    cb(formatted);
                } catch (err) {
                    cb([]);
                }
            });

            socket.on('check-quote', async (ans, hash, cipherType, keys, solve, cb) => {
                try {
                    const res = await wsUtil.checkAnswerCorrectness(ans, hash, cipherType, keys, solve);
                    const isCorrect = res.correct;
                    cb(isCorrect);
                    if (!isCorrect) return;

                    game = await Game.findById(user.currentGame).populate('users').exec();
                    if (game.state != 'started') {
                        socket.emit('error', 'The game is not in the game started state, please refresh the page');
                        return;
                    }

                    if (!game || !game.users || game.users.length === 0) return;
                    const solveTime = (Date.now() - game.metadata.startedAt.getTime()) / 1000;
                    const length = ans.length;

                    let eloChanges = null;
                    if (game.mode === 'ranked' && game.metadata?.initialUserIds?.length > 1) {
                        const initialPlayers = await UserGame.find({ _id: { $in: game.metadata.initialUserIds } });
                        eloChanges = await wsUtil.updateStatsAfterWin(initialPlayers, user, cipherType, solveTime, length);
                    }

                    const initialPlayers = await UserGame.find({ _id: { $in: game.metadata.initialUserIds } });

                    if (game.mode === 'ranked' && game.metadata?.initialUserIds?.length === 1 && game.metadata.initialUserIds[0].equals(user._id)) {
                        user = await incrementWin(user._id, cipherType, solveTime, length, true);
                    }

                    const matchResult = {
                        winner: user.username,
                        players: initialPlayers.map(u => ({
                            username: u.username,
                            host: game.host.equals(u._id),
                            elo: u.stats?.[game.params.cipherType]?.elo ?? 1000,
                            profilePicture: u.profilePicture,
                        })),
                        eloChanges: eloChanges ?? {},
                        solveTime: solveTime,
                        plainText: res.text
                    };

                    game.state = 'finished';
                    game.lastMatchResult = matchResult; // ✅ Save to DB
                    await game.save();

                    io.to(game._id).emit('cipher-solved', matchResult);
                } catch (error) {
                    socket.emit('error', 'Error validating quote.');
                }
            });

            socket.on('forfeit-request', async (shouldForfeit) => {
                game = await Game.findById(user.currentGame).populate('users').exec();
                if (!game) return;

                if (game.state != 'started') {
                    socket.emit('error', 'The game is not in the game started state, please refresh the page');
                    return;
                }

                await handleForfeitRequest(game, shouldForfeit, io, forfeitVotesMap, rematchVotesMap, user);
            });

            socket.on('progress-update', ({ username, progress }) => {
                io.to(socket.currentRoom).emit('progress-map-update', { username, progress });
            });

            socket.on('get-match-result', async cb => {
                try {
                    game = await Game.findById(user.currentGame);
                    if (game?.state === 'finished' && game.lastMatchResult) {
                        cb(game.lastMatchResult);
                        const rematchSet = rematchVotesMap.get(game._id) || new Set();
                        socket.emit('rematch-votes', Array.from(rematchSet));
                    } else {
                        cb(null);
                    }
                } catch (err) {
                    cb(null);
                }
            });

            socket.on('rematch-request', async () => {
                game = await Game.findById(user.currentGame).populate('users').exec();
                if (!game) return;

                if (game.state != 'finished') {
                    socket.emit('error', 'The game is not in a finished state, please refresh the page');
                    return;
                }

                await handleRematchRequest(game, io, rematchVotesMap, forfeitVotesMap, user);
            });

            socket.on('disconnect', async () => {
                try {
                    let updateLobby = true;
                    let latestGame = null;

                    const latestUser = await UserGame.findById(userId);
                    if (latestUser?.currentSocketId === socketId && socket.disconnectReason != "replaced") {
                        activeSockets.delete(userId);
                        latestUser.currentSocketId = null;
                        await latestUser.save();
                    }

                    if (!socket.disconnectReason || socket.disconnectReason == 'leftGame') {
                        if (latestUser.currentGame) {
                            latestGame = await Game.findById(latestUser.currentGame).populate('users').exec();
                            if (latestGame && (latestGame.state !== 'waiting' || latestGame.mode === 'private')) {
                                updateLobby = false;
                            }

                            if (socket.disconnectReason != 'leftGame') {
                                // Do not auto-forfeit on disconnect for single-player games
                                if (latestGame.state == 'started' && latestGame.users.length > 1) {
                                    forfeitVotesMap.delete(game._id);
                                    await handleForfeitRequest(latestGame, true, io, forfeitVotesMap, rematchVotesMap, latestUser);
                                }

                                // Do not auto-rematch on disconnect for single-player games
                                if (latestGame.state == 'finished' && latestGame.users.length > 1) {
                                    rematchVotesMap.delete(game._id);
                                    await handleRematchRequest(latestGame, io, rematchVotesMap, forfeitVotesMap, latestUser);
                                }
                            }
                        }

                        if (latestGame && latestGame.host.equals(latestUser._id) && (latestGame.state !== 'waiting' || socket.disconnectReason === 'leftGame')) {
                            const newHost = latestGame.users.find(u => u.currentSocketId != null);
                            if (newHost) {
                                await Game.findByIdAndUpdate(latestGame._id, { host: newHost._id });
                            }
                        }
                    }

                    if (socket.disconnectReason == "replaced") {
                        updateLobby = false;
                    }

                    if (socket.currentRoom && socket.disconnectReason != 'replaced') {
                        io.to(socket.currentRoom).emit('players-changed');
                    }

                    if (updateLobby && !latestGame) {
                        io.to('public-lobby').emit('lobbies-updated');
                    }
                } catch (_) { }
            });
        } else {
            io.to(socketId).emit('ready');

            socket.on('get-public-lobbies', async (request, cb) => {
                try {
                    const { searchTerms = {}, limit = 50 } = request || {};
                    const MAX_LIMIT = 100;
                    const effectiveLimit = Math.min(limit, MAX_LIMIT);

                    const query = {
                        mode: { $in: ['public', 'ranked'] },
                        state: 'waiting'
                    };

                    // Fetch games + populate usernames and ensure we have all necessary fields
                    let games = await Game.find(query)
                        .select('_id params mode state createdAt users playerLimit autoFocus')
                        .sort({ createdAt: -1 }) // Newest first
                        .limit(effectiveLimit)
                        .populate({ path: 'users', select: 'username' })
                        .lean();

                    // Apply filters based on search terms
                    if (Object.keys(searchTerms).length > 0) {
                        // If we have other search terms besides 'all', ignore 'all'
                        const hasOtherTerms = Object.keys(searchTerms).some(key => key !== 'all');
                        if (hasOtherTerms) {
                            delete searchTerms['all'];
                        }
                        // If only 'all' is present, return all games without filtering
                        if (Object.keys(searchTerms).length === 0) {
                            cb(formatted);
                            return;
                        }

                        games = games.filter(game => {
                            for (const [option, terms] of Object.entries(searchTerms)) {
                                const searchText = terms.join(' ').toLowerCase();

                                switch (option) {
                                    case 'cipher:':
                                        if (!game.params?.cipherType?.toLowerCase().includes(searchText)) {
                                            return false;
                                        }
                                        break;
                                    case 'username:':
                                        if (!game.users.some(user =>
                                            user.username?.toLowerCase().includes(searchText)
                                        )) {
                                            return false;
                                        }
                                        break;
                                    case 'ranked:':
                                        const isRanked = searchText === 'true';
                                        if ((isRanked && game.mode !== 'ranked') ||
                                            (!isRanked && game.mode !== 'public')) {
                                            return false;
                                        }
                                        break;
                                    case 'playerLimit:':
                                        const limitNum = parseInt(searchText);
                                        if (!isNaN(limitNum) && game.playerLimit !== limitNum) {
                                            return false;
                                        }
                                        break;
                                    case 'playerCount:':
                                        const countNum = parseInt(searchText);
                                        if (!isNaN(countNum) && game.users.length !== countNum) {
                                            return false;
                                        }
                                        break;
                                }
                            }
                            return true;
                        });
                    }

                    const formatted = games.map(g => ({
                        id: g._id,
                        cipherType: g.params.cipherType,
                        mode: g.mode,
                        state: g.state,
                        createdAt: g.createdAt,
                        playerCount: g.users.length,
                        playerLimit: g.playerLimit,
                        usernames: g.users.map(u => u.username),
                        autoFocus: g.autoFocus,
                        K: g.params.K,
                        Solve: g.params.Solve
                    }));

                    cb(formatted);
                } catch (err) {
                    cb([]);
                }
            });

            socket.on('disconnect', async () => {
                try {
                    const active = lobbySockets.get(userId);
                    if (active === socketId) {
                        lobbySockets.delete(userId);
                    }
                } catch (_) { }
            });
        }
    });

}

async function handleForfeitRequest(game, shouldForfeit, io, forfeitVotesMap, rematchVotesMap, user) {
    if (!forfeitVotesMap.has(game._id)) {
        forfeitVotesMap.set(game._id, new Set());
    }

    const forfeitSet = forfeitVotesMap.get(game._id);

    if (user.currentSocketId) {
        const username = user.username;
        if (shouldForfeit) {
            forfeitSet.add(username);
        } else {
            if (!forfeitSet.has(username)) return;
            forfeitSet.delete(username);
        }
    }

    const connectedUsernames = game.users
        .filter(u => u.currentSocketId)
        .map(u => u.username);
    const allGaveUp = connectedUsernames.every(name => forfeitSet.has(name));

    if (allGaveUp) {
        forfeitVotesMap.delete(game._id);
        rematchVotesMap.delete(game._id);

        const plainQuote = await wsUtil.getQuote(
            game.quote.id,
            game.params.cipherType,
            game.quote.keys,
            game.params.Solve
        );

        const initialPlayers = await UserGame.find({ _id: { $in: game.metadata.initialUserIds } });

        const matchResult = {
            winner: null,
            players: initialPlayers.map(u => ({
                username: u.username,
                host: game.host.equals(u._id),
                elo: u.stats?.[game.params.cipherType]?.elo ?? 1000,
                profilePicture: u.profilePicture,
            })),
            eloChanges: game.mode === 'ranked'
                ? Object.fromEntries(initialPlayers.map(u => [u.username, 0]))
                : {},
            solveTime: null,
            plainText: plainQuote,
            forfeit: true,
        };

        game.state = 'finished';
        game.lastMatchResult = matchResult;
        await game.save();

        io.to(game._id).emit('cipher-solved', matchResult);
    }

    io.to(game._id).emit('forfeit-votes', Array.from(forfeitSet));
}

async function handleRematchRequest(game, io, rematchVotesMap, forfeitVotesMap, user) {
    if (!rematchVotesMap.has(game._id)) {
        rematchVotesMap.set(game._id, new Set());
    }

    const rematchSet = rematchVotesMap.get(game._id);

    if (user.currentSocketId) {
        const username = user.username;
        rematchSet.add(username);
    }

    io.to(game._id).emit('rematch-votes', Array.from(rematchSet));

    const connectedUsernames = game.users
        .filter(u => u.currentSocketId)
        .map(u => u.username);
    // If no one is connected, do not proceed with rematch logic
    if (connectedUsernames.length === 0) return;
    const allAgreed = connectedUsernames.every(name => rematchSet.has(name));

    if (!allAgreed) return;

    rematchVotesMap.delete(game._id);
    forfeitVotesMap.delete(game._id);

    // Remove disconnected users BEFORE rematch
    const toRemove = game.users.filter(u => !u.currentSocketId);
    for (const user of toRemove) {
        await leaveGameCleanup(user._id, game._id);
    }

    if (toRemove.length > 0) {
        game = await Game.findById(game._id).populate('users').exec();
    }

    // Generate new cipher and reset game
    const newQuote = await generateQuote(game.params);
    game.quote = {
        id: newQuote.id,
        encodedText: newQuote.quote,
        keys: newQuote.keys
    };
    game.state = 'started';
    game.metadata = {
        initialUserIds: game.users,
        startedAt: new Date()
    };
    await game.save();

    io.to(game._id).emit('start-game', game.params, game.autoFocus, game.quote);
    io.to(game._id).emit('rematch-votes', []);
    io.to(game._id).emit('forfeit-votes', []);
}