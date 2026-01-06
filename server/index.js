import gracefulFs from 'graceful-fs';
import fs from 'fs';
gracefulFs.gracefulify(fs);

import http from 'http';
import express from 'express';
import helmet from 'helmet';
import 'dotenv/config';
import { handler } from '../build/handler.js';
import { setupSocketServer } from '../ws/socketServer.js';

const app = express();
app.use(helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
const server = http.createServer(app);

console.log(`[server] ENV PORT = ${process.env.PORT}`);

// Initialize Socket.io
const io = setupSocketServer(server);

// SvelteKit handlers
app.use(handler);

server.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log('Server is running');
});

const gracefulShutdown = async (signal) => {
  console.log(`[server] ${signal} received, starting graceful shutdown...`);

  server.close(() => {
    console.log('[server] HTTP server closed');
  });

  io.close(() => {
    console.log('[server] Socket.IO server closed');
  });

  setTimeout(() => {
    console.log('[server] Graceful shutdown complete');
    process.exit(0);
  }, 5000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('[server] Unhandled Promise Rejection:', err);
});