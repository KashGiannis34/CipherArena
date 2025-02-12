import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { Server } from 'socket.io';

export const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer, {
			cors: {
				origin: "*", // Adjust this in production
			},
		});

		io.on('connect', (socket) => {
			socket.emit('eventFromServer', 'Hello, World');
		})
		console.log("Websocket server connected");
	}
}

export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});
