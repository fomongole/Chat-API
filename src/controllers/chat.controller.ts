import { Server, Socket } from 'socket.io';
import { chatService } from '../services/chat.service';
import { catchAsync } from '../utils/catch.async';

export const registerChatHandlers = (io: Server, socket: Socket) => {
    const user = (socket as any).user;

    // Join a private conversation
    socket.on("join_conversation", async (data: { recipientId: string }) => {
        const conversation = await chatService.getOrCreateConversation(user.id, data.recipientId);

        // Put the user in the room
        socket.join(conversation.id);

        // Send history for THIS conversation only
        const history = await chatService.getConversationHistory(conversation.id);
        socket.emit("load_history", history);

        console.log(`User ${user.username} joined room: ${conversation.id}`);
    });

    const handlePrivateMessage = catchAsync(async (data: { conversationId: string, message: string }) => {
        const savedMessage = await chatService.processPrivateMessage(user.id, data.conversationId, data.message);

        // Emit only to people in that conversation room
        io.to(data.conversationId).emit("receive_message", savedMessage);
    });

    socket.on("send_message", handlePrivateMessage);
};