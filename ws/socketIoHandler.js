import { Server } from 'socket.io';
import { UserAuth } from '../src/db/models/UserAuth.js';
import { Game } from '../src/db/models/Game.js';
import { ObjectId } from 'mongodb';
import { authenticate } from '../src/db/auth/authenticate.js';

export default async function injectSocketIO(server) {
    if (!server.httpServer) return;

    const io = new Server(server.httpServer, {
        cors: {
            origin: "*", // Adjust this in production
        },
    });
    globalThis.io = io;

    io.on('connection', async (socket) => {
        const auth = extractAuthToken(socket.handshake.headers.cookie);
        console.log('Auth token:', auth);
        if (!auth) {
            console.log('No auth-token found in cookies');
            socket.disconnect(); // Disconnect the socket if no auth-token is found
            return;
        }
        const user = await UserAuth.findById(new ObjectId(auth['id']));
        console.log(user._id);

        socket.on('join-room', (roomID) => {
            socket.join(roomID);
            console.log(`User ${user._id} joined room ${roomID}`);
        })

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.id}`);
            const game = await Game.findById(user.currentGame);
            if (game) {
                // Remove user from game users array
                game.users = game.users.filter(userId => !userId.equals(user._id));
                if (game.users.length === 0) {
                    // If no users left, delete the game
                    console.log('No users left in game, deleting game:', game._id);
                    await game.deleteOne().catch(err => console.error('Error deleting game:', err));
                } else {
                    // Save the game after removing the user
                    game.save().catch(err => console.error('Error saving game:', err));
                }
            }

            user.currentGame = null; // Clear the current game on disconnect
            user.save().catch(err => console.error('Error saving user on disconnect:', err));


        });
    });

    console.log('SocketIO injected');
}

// Function to extract the auth-token
function extractAuthToken(cookieString) {
    const cookies = cookieString.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === "auth-token") {
            const auth = authenticate(value);
            return auth;
        }
    }
    return null; // Return null if auth-token is not found
}