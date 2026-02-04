import { Server, Socket } from 'socket.io';
import { chatService } from '../services/chat.service';
import { catchAsync } from '../utils/catch.async';
import { prisma } from '../config/prisma';

export const registerChatHandlers = (io: Server, socket: Socket) => {
    const user = (socket as any).user;

    socket.on("join_conversation", async (data: { recipientId: string }) => {
        const conversation = await chatService.getOrCreateConversation(user.id, data.recipientId);

        socket.join(conversation.id);
        socket.emit("conversation_joined", { conversationId: conversation.id });

        const history = await chatService.getConversationHistory(conversation.id);
        socket.emit("load_history", history);

        console.log(`User ${user.username} joined room: ${conversation.id}`);
    });

    const handlePrivateMessage = catchAsync(async (data: { conversationId: string, message: string, replyToId?: string, recipientId: string }) => {
        // The frontend MUST send 'recipientId' in send_message.
        // If it doesn't, then we can't notify the specific user room easily without database lookup.

        const savedMessage = await chatService.processPrivateMessage(
            user.id,
            data.conversationId,
            data.message,
            data.replyToId
        );

        // 1. Send to the conversation room (for the active chat window)
        io.to(data.conversationId).emit("receive_message", savedMessage);

        // 2. Send a notification to the recipient's PERSONAL room (for the sidebar)
        // This allows them to see "Unread: 1" even if they are in another chat.
        io.to(data.recipientId).emit("new_message_notification", {
            senderId: user.id,
            message: data.message
        });
    });

    const handleMarkAsRead = catchAsync(async (data: { conversationId: string, recipientId: string }) => {
        await chatService.markMessagesAsRead(data.conversationId, user.id);

        const me = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isPrivate: true }
        });

        if (me && me.isPrivate) {
            return;
        }

        io.to(data.recipientId).emit("messages_read", {
            conversationId: data.conversationId,
            readerId: user.id
        });
    });

    const handleDeleteMessage = catchAsync(async (data: { conversationId: string, messageId: string }) => {
        const deletedMessage = await chatService.deleteMessage(user.id, data.messageId);
        io.to(data.conversationId).emit("message_deleted", deletedMessage);
    });

    socket.on("typing", (data: { conversationId: string, recipientId: string }) => {
        socket.to(data.recipientId).emit("user_typing", {
            userId: user.id,
            conversationId: data.conversationId
        });
    });

    socket.on("stop_typing", (data: { conversationId: string, recipientId: string }) => {
        socket.to(data.recipientId).emit("user_stop_typing", {
            userId: user.id
        });
    });

    socket.on("send_message", handlePrivateMessage);
    socket.on("delete_message", handleDeleteMessage);
    socket.on("mark_as_read", handleMarkAsRead);
};