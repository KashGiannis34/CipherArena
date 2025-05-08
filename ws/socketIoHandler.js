import { Server } from 'socket.io';
import { Game } from '../src/db/models/Game.js';
import { ObjectId } from 'mongodb';
import { authenticate } from '../src/db/auth/authenticate.js';
import { UserGame } from '../src/db/models/UserGame.js';

export default async function injectSocketIO(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        },
    });
    globalThis.io = io;

    io.use(async (socket, next) => {
        // Authenticate socket before allowing connection
        const token = socket.handshake.auth.token;

        if (!token) {
            console.error('No token provided in socket handshake');
            return next(new Error("No token"));
        }

        console.log("Token:", token);
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

        try {
            user = await UserGame.findById(new ObjectId(userId));
            const oldSocketId = user.currentSocketId;

            if (oldSocketId && oldSocketId !== socketId) {
                const oldSocket = io.sockets.sockets.get(oldSocketId);
                if (oldSocket) {
                    oldSocket.disconnect();
                }
            }
        } catch (err) {
            console.error('Socket error:', err);
        }

        // Update the user's active socket in the DB
        await UserGame.findByIdAndUpdate(userId, { currentSocketId: socketId });
        io.to(socketId).emit('ready');

        socket.on('join-room', (roomId) => {
            try {
                socket.join(roomId.toString());
                socket.currentRoom = roomId.toString();
                console.log(`✅ ${user._id} joined room ${roomId}`);
                io.to(roomId).emit('players-changed');
            } catch (err) {
                console.error('join-room error:', err);
            }
        })

        socket.on('leave-room', (roomId) => {
            io.to(roomId).emit('players-changed');
        });

        socket.onAny((event, ...args) => {
            console.log('📡 Received event:', event, args);
        });

        socket.on('disconnect', async () => {
            const latest = await UserGame.findById(userId);
            if (latest?.currentSocketId === socketId) {
                await UserGame.findByIdAndUpdate(userId, { currentSocketId: null });
            }

            const roomId = socket.currentRoom;
            if (roomId) {
                io.to(roomId).emit('players-changed');
            }
        });
    });

    console.log('SocketIO injected');
}