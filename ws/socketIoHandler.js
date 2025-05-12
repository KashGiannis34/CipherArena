import { Server } from 'socket.io';
import { Game } from '../src/db/models/Game.js';
import { ObjectId } from 'mongodb';
import { authenticate } from '../src/db/auth/authenticate.js';
import { UserGame } from '../src/db/models/UserGame.js';
import { leaveGameCleanup } from '../src/db/leaveGameCleanup.js';

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

            game = await Game.findById(new ObjectId(user.currentGame)).populate('users').exec();
            if (!game) {
                console.error('Game not found for user:', userId);
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

                socket.join(roomId.toString());
                socket.currentRoom = roomId.toString();
                // console.log(`✅ ${user._id} joined room ${roomId}`);
                io.to(roomId).emit('players-changed');
            } catch (err) {
                console.error('join-room error:', err);
            }
        });

        socket.on('leave-room', (roomId) => {
            io.to(roomId).emit('players-changed');
        });

        socket.on('kick-player', async ({ username }) => {
            try {
                game = await Game.findById(new ObjectId(user.currentGame)).populate('users').exec();
                if (!game.host.equals(user._id)) {
                    console.log("Only host can kick players");
                    return socket.emit('error', 'Only the host can kick players');
                }

                const targetUser = game.users.find(user => user.username == username);
                if (!targetUser) {
                    return socket.emit('error', 'That player is not in your game');
                }
                if (targetUser._id.equals(user._id)) return socket.emit('error', 'You cannot kick yourself');

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
                const game = await Game.findById(new ObjectId(user.currentGame));
                if (!game.host.equals(user._id)) {
                    console.log("Only host can start the game");
                    return socket.emit('error', 'Only the host can start the game');
                }

                io.to(socket.currentRoom).emit('start-game', game.params, game.autoFocus, game.quote);
            } catch (err) {
                console.error('start-game error:', err);
            }
        });

        socket.onAny((event, ...args) => {
            console.log('📡 Received event:', event, args);
        });

        socket.on('disconnect', async () => {

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

            if (!socket.disconnectReason) {
                console.log(`User ${userId} disconnected no reason`);
                const latestGame = await Game.findById(latestUser.currentGame).populate('users').exec();
                if (latestGame && latestGame.host.equals(latestUser._id)) {
                    const newHost = latestGame.users.find(u => u.currentSocketId != null);
                    if (newHost) {
                        await Game.findByIdAndUpdate(game._id, { host: newHost._id });
                        console.log(`🔁 Host transferred to ${newHost._id.toString()}`);
                    } else {
                        console.log(`🟡 No replacement host found (all players disconnected)`);
                    }
                }
            }

            console.log("current room", socket.currentRoom);
            if (socket.currentRoom) {
                console.log("PLayers changed", socket.currentRoom);
                io.to(socket.currentRoom).emit('players-changed');
            }
        });
    });

    console.log('SocketIO injected');
}