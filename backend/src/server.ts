import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { registerChatHandlers } from './controllers/chat.controller';
import { authMiddleware } from './middlewares/auth.middleware';
import { prisma } from './config/prisma';

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});

io.use(authMiddleware);

io.on("connection", async (socket) => {
    const userId = (socket as any).user.id;

    try {
        // 1. Update user to ONLINE in Database
        // We wrap this in a try/catch. If the user doesn't exist (because of DB reset),
        // we don't want to crash the server.
        await prisma.user.update({
            where: { id: userId },
            data: { isOnline: true }
        });

        // Broadcast to everyone that this user is online
        socket.broadcast.emit("user_status_change", { userId, isOnline: true });

    } catch (error) {
        console.error(`⚠️ Could not update user status (User ID: ${userId} might not exist):`);
        // If the user doesn't exist in DB, disconnect the socket to force frontend to re-login
        socket.disconnect();
        return;
    }

    // Only register handlers if user exists
    registerChatHandlers(io, socket);

    socket.on("disconnect", async () => {
        console.log(`🔌 Disconnected: ${socket.id}`);

        try {
            // 2. Update user to OFFLINE and set LAST SEEN
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isOnline: false,
                    lastSeen: new Date()
                }
            });

            // Broadcast offline status
            socket.broadcast.emit("user_status_change", { userId, isOnline: false, lastSeen: new Date() });
        } catch (error) {
            // Silently fail if user is already deleted
        }
    });
});

httpServer.listen(env.PORT, () => {
    console.log(`🚀 Secure Server running on port ${env.PORT}`);
});