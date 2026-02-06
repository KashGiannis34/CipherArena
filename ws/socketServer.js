import { Server } from "socket.io";
import Redis from "ioredis";

import { UserGame } from "../shared-server/game/UserGame.js";
import { authenticate } from "../shared-server/utils/authenticate.js";
import { setupConnectionHandler } from "./connectionHandler.js";

export function setupSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "https://cipher-arena.fly.dev",
        "https://cipherarena.com",
        "https://www.cipherarena.com",
      ],
      credentials: true,
    },
  });

  globalThis.io = io;

  const redis = new Redis(process.env.REDIS_URL);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token"));
    }

    const auth = authenticate(token);
    if (auth == undefined) {
      console.log("No AUTH");
      return next(new Error("Invalid token"));
    }

    const user = await UserGame.findById(auth.id);
    if (!user) {
      return next(new Error("Unauthorized"));
    }

    socket.userId = auth.id;
    return next();
  });

  setupConnectionHandler(io, redis);

  return io;
}
