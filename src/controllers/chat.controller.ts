import { Server, Socket } from 'socket.io';
import { chatService } from '../services/chat.service';
import { catchAsync } from '../utils/catch.async';

export const registerChatHandlers = (io: Server, socket: Socket) => {

    // 1. Emit history to the user who just connected
    chatService.getRecentMessages().then(messages => {
        socket.emit("load_history", messages);
    });

    const handleMessage = catchAsync(async (data: { message: string }) => {
        const user = (socket as any).user;

        // Save to DB
        const savedMessage = await chatService.processMessage(user.id, data.message);

        // Broadcast to everyone
        io.emit("receive_message", savedMessage);
    });

    socket.on("send_message", handleMessage);
};