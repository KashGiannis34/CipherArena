import { Server } from 'socket.io';
import { Game } from '../src/db/models/Game.js';
import { Quote } from '../src/db/models/Quote.js';
import { encodeQuote, stripQuote } from '../src/lib/util/CipherUtil.js';
import { ObjectId } from 'mongodb';
import { authenticate } from '../src/db/auth/authenticate.js';
import { UserGame } from '../src/db/models/UserGame.js';
import { leaveGameCleanup } from '../src/db/leaveGameCleanup.js';
import socketIORateLimiter from '@d3vision/socket.io-rate-limiter';
import * as wsUtil from './wsUtil.js';
import { generateQuote } from '../src/db/GenerateQuote.js';


export default async function injectSocketIO(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        },
    });
    globalThis.io = io;
    const activeSockets = new Map(); // userId → socketId
    const lobbySockets = new Map(); // userId → socketId
    const rematchVotesMap = new Map(); // gameId → Set of usernames who requested rematch

    io.use(async (socket, next) => {
        // Authenticate socket before allowing connection
        const token = socket.handshake.auth.token;

        if (!token) {
            console.error('No token provided in socket handshake');
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
                console.log("Existing socket ID: ", existingSocketId);
                console.log("Socket ID: ", socketId);
                if (existingSocketId && existingSocketId !== socketId) {
                    console.log("Replacing socket: ", existingSocketId);
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
                        console.warn(`User ${userId} has invalid game. Clearing...`);
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
            } catch (err) {
                console.error('Socket error:', err);
            }
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
            } catch (err) {
                console.error('join-lobby error:', err);
            }
        }

        // Update the user's active socket in the DB
        if (user && socket.currentRoom != 'public-lobby') {
            user.currentSocketId = socketId;
            await user.save();
        }
        io.to(socketId).emit('ready');

        if (socket.currentRoom != 'public-lobby') {
            socket.on('join-room', async () => {
                try {
                    console.log("Socket joining room: ", socketId);
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
                    // console.log(`${user._id} joined room ${roomId}`);
                    io.to(game._id).emit('players-changed');
                    if (game.state == 'waiting') {
                        console.log("Lobbies updated");
                        io.to('public-lobby').emit('lobbies-updated');
                    }
                } catch (err) {
                    console.error('join-room error:', err);
                }
            });

            socket.on('leave-room', () => {
                if (game._id && rematchVotesMap.has(game._id)) {
                    rematchVotesMap.delete(game._id);
                    io.to(game._id).emit('rematch-votes', []); // Notify clients of vote reset
                }
            });

            socket.on('kick-player', async ({ username }) => {
                try {
                    game = await Game.findById(user.currentGame).populate('users').exec();
                    if (!game.host.equals(user._id)) {
                        console.log("Only host can kick players");
                        socket.emit('error', 'Only the host can kick players');
                    }

                    const targetUser = game.users.find(user => user.username == username);
                    if (!targetUser) {
                        socket.emit('error', 'That player is not in your game');
                    }
                    if (targetUser._id.equals(user._id)) socket.emit('error', 'You cannot kick yourself');

                    // 1. Run DB cleanup
                    await leaveGameCleanup(targetUser._id, game._id);
                    console.log("CLeanup done");

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
                    console.log("Lobbies updated");
                } catch (err) {
                    console.error('kick-player error:', err);
                    socket.emit('error', 'Internal error during kick');
                }
            });

            socket.on('start-game', async () => {
                try {
                    game = await Game.findById(user.currentGame).populate('users').exec();

                    if (!game.host.equals(user._id)) {
                        console.log("Only host can start the game");
                        socket.emit('error', 'Only the host can start the game');
                        return;
                    }

                    game.state = 'started';
                    game.metadata = {
                        ...(game.metadata ?? {}),
                        initialUserIds: game.users,
                        startedAt: new Date()
                    };

                    await game.save();

                    io.to(socket.currentRoom).emit('start-game', game.params, game.autoFocus, game.quote);
                    io.to('public-lobby').emit('lobbies-updated');
                    console.log("Lobbies updated");
                } catch (err) {
                    console.error('start-game error:', err);
                }
            });

            socket.on('get-cipher-info', async (cb) => {
                try {
                    game = await Game.findById(user.currentGame);
                    if (!game.state == 'started') {
                        console.log("Game has not started yet");
                        socket.emit('error', 'Game has not started yet');
                    } else {
                        cb({params: game.params, autoFocus: game.autoFocus, quote: game.quote});
                    }
                } catch (err) {
                    console.error('retrieve info error:', err);
                }
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
                    console.error('get-initial-players error:', err);
                    cb([]);
                }
            });

            socket.on('check-quote', async (ans, hash, cipherType, keys, solve, startTime, cb) => {
                try {
                    const isCorrect = await wsUtil.checkAnswerCorrectness(ans, hash, cipherType, keys, solve);
                    cb(isCorrect);
                    if (!isCorrect) return;

                    game = await Game.findById(user.currentGame).populate('users').exec();
                    if (!game || !game.users || game.users.length === 0) return;
                    const solveTime = Math.round((Date.now() - game.metadata.startedAt.getTime()) / 1000);

                    let eloChanges = null;
                    if (game.mode === 'ranked' && game.metadata?.initialUserIds?.length > 1) {
                        const initialPlayers = await UserGame.find({ _id: { $in: game.metadata.initialUserIds } });
                        eloChanges = await wsUtil.updateStatsAfterWin(initialPlayers, user, cipherType, solveTime);
                    }

                    const initialPlayers = await UserGame.find({ _id: { $in: game.metadata.initialUserIds } });

                    const matchResult = {
                        winner: user.username,
                        players: initialPlayers.map(u => ({
                            username: u.username,
                            host: game.host.equals(u._id),
                            elo: u.stats?.[game.params.cipherType]?.elo ?? 1000,
                            profilePicture: u.profilePicture
                        })),
                        eloChanges: eloChanges ?? {},
                        solveTime: solveTime
                    };

                    game.state = 'finished';
                    game.lastMatchResult = matchResult; // ✅ Save to DB
                    await game.save();

                    io.to(game._id).emit('cipher-solved', matchResult);
                } catch (error) {
                    console.error('❌ Error in check-quote:', error);
                    socket.emit('error', 'Error validating quote.');
                }
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
                    console.error('Error retrieving match result:', err);
                    cb(null);
                }
            });

            socket.on('rematch-request', async () => {
                game = await Game.findById(user.currentGame).populate('users').exec();
                if (!game) return;

                const username = user.username;

                if (!rematchVotesMap.has(game._id)) {
                    rematchVotesMap.set(game._id, new Set());
                }

                const rematchSet = rematchVotesMap.get(game._id);
                rematchSet.add(username);

                // If all players have voted:
                const allUsernames = game.users.map(u => u.username);
                const allAgreed = allUsernames.every(name => rematchSet.has(name));

                io.to(socket.currentRoom).emit('rematch-votes', Array.from(rematchSet));

                if (allAgreed) {
                    console.log("All agreed to rematch!");
                    rematchVotesMap.delete(game._id); // Reset vote tracker

                    // Generate a new cipher and reset game
                    const newQuote = await generateQuote(game.params);
                    game.quote = {
                        id: newQuote.id,
                        encodedText: newQuote.quote,
                        keys: newQuote.keys
                    };
                    game.state = 'started';
                    game.metadata = {
                        ...(game.metadata ?? {}),
                        initialUserIds: game.users
                    };
                    await game.save();

                    io.to(socket.currentRoom).emit('start-game', game.params, game.autoFocus, game.quote);
                    io.to(socket.currentRoom).emit('rematch-votes', []);
                }
            });

            socket.onAny((event, ...args) => {
                console.log('📡 ' + user.username + ' Received event (game):', event, args);
            });

            socket.on('disconnect', async () => {
                try {
                    let updateLobby = true;
                    let latestGame = null;

                    if (socket.disconnectReason) {
                        console.log(socket.disconnectReason+": "+socketId);
                    }

                    const latestUser = await UserGame.findById(userId);
                    if (latestUser?.currentSocketId === socketId && socket.disconnectReason != "replaced") {
                        activeSockets.delete(userId);
                        latestUser.currentSocketId = null;
                        await latestUser.save();
                    }

                    const rematchSet = rematchVotesMap.get(latestUser.currentGame);
                    if (rematchSet) {
                        rematchSet.delete(user.username);
                        io.to(latestUser.currentGame).emit('rematch-votes', Array.from(rematchSet));
                    }

                    if (!socket.disconnectReason) {
                        console.log(`User ${userId} disconnected no reason`);
                        if (latestUser.currentGame) {
                            latestGame = await Game.findById(latestUser.currentGame).populate('users').exec();
                            if (latestGame && (latestGame.state !== 'waiting' || latestGame.mode === 'private')) {
                                updateLobby = false;
                            }
                        }

                        if (latestGame && latestGame.host.equals(latestUser._id)) {
                            const newHost = latestGame.users.find(u => u.currentSocketId != null);
                            if (newHost) {
                                await Game.findByIdAndUpdate(latestGame._id, { host: newHost._id });
                                console.log(`🔁 Host transferred to ${newHost._id.toString()}`);
                            }
                        }
                    }

                    if (socket.disconnectReason == "replaced") {
                        updateLobby = false;
                    }

                    if (socket.currentRoom) {
                        io.to(socket.currentRoom).emit('players-changed');
                    }

                    if (updateLobby && !latestGame) {
                        io.to('public-lobby').emit('lobbies-updated');
                        console.log("Lobbies updated");
                    }
                } catch (err) {
                    console.error(`❌ Error during disconnect for user ${userId}:`, err);
                }
            });
        } else {
            socket.onAny((event, ...args) => {
                console.log('📡 ' + user.username + ' Received event (lobby):', event, args);
            });

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
                    console.error('Error in get-public-lobbies:', err);
                    cb([]);
                }
            });

            socket.on('disconnect', async () => {
                try {
                    const active = lobbySockets.get(userId);
                    if (active === socketId) {
                        lobbySockets.delete(userId);
                    }

                    if (socket.disconnectReason) {
                        console.log(socket.disconnectReason+" (lobby): "+socketId);
                    }
                } catch (err) {
                    console.error(`❌ Error during disconnect for user ${userId}:`, err);
                }
            });
        }
    });

    console.log('SocketIO injected');
}