import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { registerChatHandlers } from './controllers/chat.controller';
import { authMiddleware } from './middlewares/auth.middleware';

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

io.use(authMiddleware);

io.on("connection", (socket) => {
    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
        console.log(`🔌 Disconnected: ${socket.id}`);
    });
});

httpServer.listen(env.PORT, () => {
    console.log(`🚀 Secure Server running on port ${env.PORT}`);
});