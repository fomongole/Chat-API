import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

// 1. Connection: The moment a client shakes hands with the server
io.on("connection", (socket: Socket) => {
    console.log(`✨ New connection: ${socket.id}`);

    //2. Listen for the 'send_message' event from the clients
    socket.on("send_message", (data: { message: string }) => {
        console.log(`📩 Message received from ${socket.id}:`, data.message);

        //3. Emit the 'receive_message' event to the client
        io.emit("receive_message", {
            userId: socket.id,
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });

    socket.on("disconnect", (reason) => {
        console.log(`❌ User ${socket.id} disconnected. Reason: ${reason}`);
    });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});