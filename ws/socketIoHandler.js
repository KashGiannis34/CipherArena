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
        try {
            const auth = extractAuthToken(socket.handshake.headers.cookie);
            const connectToken = socket.handshake.auth.connectToken;
            if (!auth) {
                next(new Error('Unauthorized'));
            }
            const user = await UserGame.findById(auth['id']);
            if (!user) {
                next(new Error('Unauthorized'));
            }

            socket.userId = auth['id'];
            next();
        } catch (err) {
            console.error('Socket authentication error:', err);
            return next(new Error(err.toString()));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        const socketId = socket.id;

        try {
            const user = await UserGame.findById(new ObjectId(userId));
            const oldSocketId = user.currentSocketId;

            if (oldSocketId && oldSocketId !== socketId) {
                const oldSocket = io.sockets.sockets.get(oldSocketId);
                if (oldSocket) {
                    oldSocket.emit('error', 'You were disconnected due to a new login.');
                    oldSocket.disconnect();
                }
            }
        } catch (err) {
            console.error('Socket error:', err);
        }

        // Update the user's active socket in the DB
        await UserGame.findByIdAndUpdate(userId, { currentSocketId: socketId });

        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`User joined room ${roomId}`);

            // Broadcast to all in room to re-fetch players
            io.to(roomId).emit('players-changed');
        })

        socket.on('leave-room', async (roomId) => {
            io.to(roomId).emit('players-changed');
        });

        socket.onAny((event, ...args) => {
            console.log('📡 Received event:', event, args);
        });

        socket.on('disconnect', async () => {
            // Clear currentSocketId only if it matches
            const latest = await UserGame.findById(userId);
            if (latest?.currentSocketId === socketId) {
                await UserGame.findByIdAndUpdate(userId, { currentSocketId: null });
                console.log(`User ${userId} disconnected from ${socketId}`);
            }
        });
    });

    console.log('SocketIO injected');
}

// Function to extract the auth-token
function extractAuthToken(cookieString) {
    const cookies = cookieString.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key == "auth-token") {
            const auth = authenticate(value);
            return auth;
        }
    }
    return null; // Return null if auth-token is not found
}