import { Server, Socket } from 'socket.io';
import { chatService } from '../services/chat.service';
import { catchAsync } from '../utils/catch.async';
import { prisma } from '../config/prisma';

export const registerChatHandlers = (io: Server, socket: Socket) => {
    const user = (socket as any).user;

    /**
     * Join Conversation Room
     * Used when a user clicks on a chat in the sidebar.
     * This establishes the context for "Active Window" events (typing, read receipts).
     */
    socket.on("join_conversation", async (data: { recipientId: string }) => {
        const conversation = await chatService.getOrCreateConversation(user.id, data.recipientId);

        socket.join(conversation.id);
        socket.emit("conversation_joined", { conversationId: conversation.id });

        const history = await chatService.getConversationHistory(conversation.id);
        socket.emit("load_history", history);

        console.log(`User ${user.username} joined room: ${conversation.id}`);
    });

    /**
     * Handle Sending Messages
     * This handles 3 distinct updates.
     */
    const handlePrivateMessage = catchAsync(async (data: { conversationId: string, message: string, replyToId?: string, recipientId: string }) => {
        // 1. Database Persist: Save message and update conversation timestamp
        const savedMessage = await chatService.processPrivateMessage(
            user.id,
            data.conversationId,
            data.message,
            data.replyToId
        );

        // 2. Room Emission: Updates the 'Active Chat Window' for both parties immediately
        io.to(data.conversationId).emit("receive_message", savedMessage);

        // 3. Recipient Sidebar Notification
        // Sends to the recipient's personal room (joined in server.ts).
        // Triggers: Sidebar re-sort, Unread Badge increment, "New Message" preview.
        io.to(data.recipientId).emit("new_message_notification", {
            conversationId: data.conversationId,
            senderId: user.id,
            message: data.message,
            isOwn: false // Explicitly false: Recipient should count this as unread
        });

        // 4. Sender Sidebar Notification (The "Sender Blind Spot" Fix)
        // Sends to the sender's personal room.
        // Triggers: Sidebar re-sort (jump to top) and updates preview to "You: ..."
        io.to(user.id).emit("new_message_notification", {
            conversationId: data.conversationId,
            senderId: data.recipientId, // Map to the *Target* user in the list
            message: `You: ${data.message}`,
            isOwn: true // Explicitly true: Sender should NOT increment unread count
        });
    });

    /**
     * Marks messages as read.
     * Logic: Updates DB, then notifies the *sender* that their message was read.
     */
    const handleMarkAsRead = catchAsync(async (data: { conversationId: string, recipientId: string }) => {
        await chatService.markMessagesAsRead(data.conversationId, user.id);

        const me = await prisma.user.findUnique({
            where: { id: user.id },
            select: { isPrivate: true }
        });

        // Privacy: If I am private, do not send Read Receipts
        if (me && me.isPrivate) {
            return;
        }

        // Notify the OTHER person that I read their message
        io.to(data.recipientId).emit("messages_read", {
            conversationId: data.conversationId,
            readerId: user.id
        });
    });

    const handleDeleteMessage = catchAsync(async (data: { conversationId: string, messageId: string }) => {
        const deletedMessage = await chatService.deleteMessage(user.id, data.messageId);
        // Notify room to remove/update the bubble
        io.to(data.conversationId).emit("message_deleted", deletedMessage);
    });

    // Typing Indicators (Ephemeral events, not stored in DB)
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