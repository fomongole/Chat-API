import { prisma } from '../config/prisma';
import { AppError } from '../utils/app.error';

export class ChatService {
    /**
     * Finds or Creates a 1-on-1 Conversation.
     * Uses strict AND logic to prevent duplicate conversations between same 2 users.
     */
    async getOrCreateConversation(user1Id: string, user2Id: string) {
        let conversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: user1Id } } },
                    { participants: { some: { id: user2Id } } }
                ]
            },
            include: { participants: true }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participants: {
                        connect: [{ id: user1Id }, { id: user2Id }]
                    }
                },
                include: { participants: true }
            });
        }
        return conversation;
    }

    /**
     * Handles message creation securely.
     * * ATOMIC TRANSACTION:
     * We wrap message creation and conversation update in a $transaction.
     * Why? To ensure the Conversation's 'updatedAt' field ALWAYS reflects the latest message time.
     * This is crucial for sorting the sidebar correctly.
     */
    async processPrivateMessage(userId: string, conversationId: string, content: string, replyToId?: string) {
        const [newMessage] = await prisma.$transaction([
            // 1. Create the message
            prisma.message.create({
                data: {
                    content,
                    author: { connect: { id: userId } },
                    conversation: { connect: { id: conversationId } },
                    ...(replyToId && { replyTo: { connect: { id: replyToId } } })
                },
                include: {
                    author: { select: { id: true, username: true, image: true } },
                    replyTo: { select: { id: true, content: true, author: { select: { username: true } } } }
                }
            }),
            // 2. Update conversation timestamp (Trigger for "Recent Chats" sort order)
            prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
            })
        ]);

        return this.formatMessage(newMessage);
    }

    async deleteMessage(userId: string, messageId: string) {
        const message = await prisma.message.findUnique({ where: { id: messageId } });

        if (!message) throw new AppError("Message not found", 404);
        if (message.authorId !== userId) throw new AppError("You can only delete your own messages", 403);

        // Soft Delete: We keep the record but hide content
        const deletedMessage = await prisma.message.update({
            where: { id: messageId },
            data: {
                isDeleted: true,
                content: "This message was deleted"
            },
            include: {
                author: { select: { id: true, username: true, image: true } },
                replyTo: { select: { id: true, content: true, author: { select: { username: true } } } }
            }
        });

        return this.formatMessage(deletedMessage);
    }

    async getConversationHistory(conversationId: string, limit = 50) {
        const messages = await prisma.message.findMany({
            where: { conversationId },
            take: limit,
            orderBy: { createdAt: 'asc' }, // Oldest first for chat window
            include: {
                author: { select: { id: true, username: true, image: true } },
                replyTo: { select: { id: true, content: true, author: { select: { username: true } } } }
            }
        });

        return messages.map(msg => this.formatMessage(msg));
    }

    async markMessagesAsRead(conversationId: string, currentUserId: string) {
        await prisma.message.updateMany({
            where: {
                conversationId: conversationId,
                isRead: false,
                authorId: { not: currentUserId } // Only mark OTHER people's messages as read
            },
            data: { isRead: true }
        });
    }

    // Standardizer for message objects sent to frontend
    private formatMessage(msg: any) {
        return {
            id: msg.id,
            conversationId: msg.conversationId,
            username: msg.author.username,
            authorId: msg.author.id,
            image: msg.author.image,
            message: msg.isDeleted ? "This message was deleted" : msg.content,
            isDeleted: msg.isDeleted,
            isRead: msg.isRead,
            timestamp: msg.createdAt,
            replyTo: msg.replyTo ? {
                id: msg.replyTo.id,
                username: msg.replyTo.author.username,
                content: msg.replyTo.isDeleted ? "Message deleted" : msg.replyTo.content
            } : null
        };
    }
}

export const chatService = new ChatService();