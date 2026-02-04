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

app.set('io', io);

io.use(authMiddleware);

io.on("connection", async (socket) => {
    const userId = (socket as any).user.id;

    // Join a specific room for this User ID
    // This allows us to target this user specifically from anywhere
    socket.join(userId);

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isOnline: true }
        });

        socket.broadcast.emit("user_status_change", { userId, isOnline: true });

    } catch (error) {
        console.error(`⚠️ Could not update user status:`);
        socket.disconnect();
        return;
    }

    registerChatHandlers(io, socket);

    socket.on("disconnect", async () => {
        console.log(`🔌 Disconnected: ${socket.id}`);

        try {
            const lastSeen = new Date();
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isOnline: false,
                    lastSeen: lastSeen
                }
            });

            socket.broadcast.emit("user_status_change", { userId, isOnline: false, lastSeen });
        } catch (error) {
            // Silently fail
        }
    });
});

httpServer.listen(env.PORT, () => {
    console.log(`🚀 Secure Server running on port ${env.PORT}`);
});