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

// Store the io instance on the app to make it accessible in controllers
app.set('io', io);

io.use(authMiddleware);

io.on("connection", async (socket) => {
    const userId = (socket as any).user.id;

    try {
        // 1. Update user to ONLINE in Database
        await prisma.user.update({
            where: { id: userId },
            data: { isOnline: true }
        });

        // Broadcast to everyone that this user is online
        socket.broadcast.emit("user_status_change", { userId, isOnline: true });

    } catch (error) {
        console.error(`⚠️ Could not update user status (User ID: ${userId} might not exist):`);
        socket.disconnect();
        return;
    }

    // Only register handlers if user exists
    registerChatHandlers(io, socket);

    socket.on("disconnect", async () => {
        console.log(`🔌 Disconnected: ${socket.id}`);

        try {
            const lastSeen = new Date();
            // 2. Update user to OFFLINE and set LAST SEEN
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isOnline: false,
                    lastSeen: lastSeen
                }
            });

            // Broadcast offline status
            socket.broadcast.emit("user_status_change", { userId, isOnline: false, lastSeen });
        } catch (error) {
            // Silently fail if user is already deleted
        }
    });
});

httpServer.listen(env.PORT, () => {
    console.log(`🚀 Secure Server running on port ${env.PORT}`);
});