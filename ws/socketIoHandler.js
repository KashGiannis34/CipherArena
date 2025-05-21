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

        const connectToken = socket.handshake.auth.connectToken;
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
            socketIORateLimiter({ proxy: true, maxBurst: 10, perSecond: 1, gracePeriodInSeconds: 15, emitClientHtmlError: true }, socket)
        );

        try {
            user = await UserGame.findById(new ObjectId(userId));
            oldSocketId = activeSockets.get(userId);

            if (oldSocketId && oldSocketId !== socketId) {
                const oldSocket = io.sockets.sockets.get(oldSocketId);
                if (oldSocket) {
                    oldSocket.disconnectReason = 'replaced';
                    oldSocket.disconnect();
                }
            }

            activeSockets.set(userId, socketId);

            game = await Game.findById(user.currentGame).populate('users').exec();
            if (!game) {
                console.error('Game not found for user:', userId);
                socket.emit('error', 'Game not found');
                socket.disconnect();
                return;
            }
        } catch (err) {
            console.error('Socket error:', err);
        }

        // Update the user's active socket in the DB
        if (user) {
            user.currentSocketId = socketId;
            await user.save();
        }
        io.to(socketId).emit('ready');

        socket.on('join-room', async (roomId) => {
            try {
                const hostUG = await UserGame.findById(game.host);
                if (!hostUG || !hostUG.currentSocketId) {
                    // Reassign host to the reconnecting user
                    await Game.findByIdAndUpdate(game._id, { host: userId });
                }

                socket.join(roomId);
                socket.currentRoom = roomId;
                // console.log(`${user._id} joined room ${roomId}`);
                io.to(roomId).emit('players-changed');
            } catch (err) {
                console.error('join-room error:', err);
            }
        });

        socket.on('leave-room', (roomId) => {
            if (rematchVotesMap.has(roomId)) {
                rematchVotesMap.delete(roomId);
                io.to(roomId).emit('rematch-votes', []); // Notify clients of vote reset
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
                await leaveGameCleanup(targetUser._id);
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
            } catch (err) {
                console.error('kick-player error:', err);
                socket.emit('error', 'Internal error during kick');
            }
        });

        socket.on('start-game', async () => {
            try {
                const game = await Game.findById(user.currentGame);

                if (!game.host.equals(user._id)) {
                    console.log("Only host can start the game");
                    socket.emit('error', 'Only the host can start the game');
                    return;
                }

                game.state = 'started';
                game.metadata = {
                    ...(game.metadata ?? {}),
                    initialUserIds: game.users
                };

                await game.save();

                io.to(socket.currentRoom).emit('start-game', game.params, game.autoFocus, game.quote);
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
                    elo: u.eloRatings.get(game.params.cipherType) ?? 1200,
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

        socket.on('check-quote', async (roomId, ans, hash, cipherType, keys, solve, startTime, cb) => {
            try {
                const isCorrect = await wsUtil.checkAnswerCorrectness(ans, hash, cipherType, keys, solve);
                cb(isCorrect);
                if (!isCorrect) return;

                game = await Game.findById(user.currentGame).populate('users').exec();
                if (!game || !game.users || game.users.length === 0) return;

                let eloChanges = null;
                if (game.mode === 'ranked' && game.metadata?.initialUserIds?.length > 1) {
                    const initialPlayers = await UserGame.find({ _id: { $in: game.metadata.initialUserIds } });
                    eloChanges = await wsUtil.updateEloAfterWin(initialPlayers, user, cipherType);
                }

                const initialPlayers = await UserGame.find({ _id: { $in: game.metadata.initialUserIds } });

                const matchResult = {
                    winner: user.username,
                    players: initialPlayers.map(u => ({
                        username: u.username,
                        host: game.host.equals(u._id),
                        elo: u.eloRatings.get(game.params.cipherType) ?? 1200,
                        profilePicture: u.profilePicture
                    })),
                    eloChanges: eloChanges ?? {}
                };

                game.state = 'finished';
                game.lastMatchResult = matchResult; // ✅ Save to DB
                await game.save();

                io.to(roomId).emit('cipher-solved', matchResult);
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
            console.log('📡 Received event:', event, args);
        });

        socket.on('disconnect', async () => {
            try {
                const active = activeSockets.get(userId);
                if (active?.id === socketId) {
                    activeSockets.delete(userId);
                }

                if (socket.disconnectReason === "replaced") {
                    console.log("replaced:", socketId);
                }

                if (socket.disconnectReason === "kicked") {
                    console.log("kicked:", socketId);
                }

                const latestUser = await UserGame.findById(userId);
                if (latestUser?.currentSocketId === socketId && socket.disconnectReason != "replaced") {
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
                    const latestGame = await Game.findById(latestUser.currentGame).populate('users').exec();
                    if (latestGame && latestGame.host.equals(latestUser._id)) {
                        const newHost = latestGame.users.find(u => u.currentSocketId != null);
                        if (newHost) {
                            await Game.findByIdAndUpdate(latestGame._id, { host: newHost._id });
                            console.log(`🔁 Host transferred to ${newHost._id.toString()}`);
                        } else {
                            console.log(`🟡 No replacement host found (all players disconnected)`);
                            rematchVotesMap.delete(latestGame._id);
                            if (latestGame.state == 'finished') {
                                console.log('DELETING GAME EVERYONE DISCONNECTED');
                                await UserGame.updateMany(
                                { _id: { $in: latestGame.users }, currentGame: latestGame._id },
                                { $set: { currentGame: null } }
                                );
                                await Game.findByIdAndDelete(latestGame._id);
                            }
                        }
                    }
                }

                console.log("current room", socket.currentRoom);
                if (socket.currentRoom) {
                    console.log("PLayers changed", socket.currentRoom);
                    io.to(socket.currentRoom).emit('players-changed');
                }
            } catch (err) {
                console.error(`❌ Error during disconnect for user ${userId}:`, err);
            }
        });
    });

    console.log('SocketIO injected');
}