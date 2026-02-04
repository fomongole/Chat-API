import { prisma } from '../config/prisma';
import { AppError } from '../utils/app.error';

export class ChatService {
    // Find or create a 1-on-1 conversation
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

    async processPrivateMessage(userId: string, conversationId: string, content: string, replyToId?: string) {
        const newMessage = await prisma.message.create({
            data: {
                content,
                author: { connect: { id: userId } },
                conversation: { connect: { id: conversationId } },
                ...(replyToId && { replyTo: { connect: { id: replyToId } } })
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                    }
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        author: { select: { username: true } }
                    }
                }
            }
        });

        return this.formatMessage(newMessage);
    }

    async deleteMessage(userId: string, messageId: string) {
        const message = await prisma.message.findUnique({ where: { id: messageId } });

        if (!message) throw new AppError("Message not found", 404);
        if (message.authorId !== userId) throw new AppError("You can only delete your own messages", 403);

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
            orderBy: { createdAt: 'asc' },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        image: true
                    }
                },
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        author: { select: { username: true } }
                    }
                }
            }
        });

        return messages.map(msg => this.formatMessage(msg));
    }

    // Mark all messages in a conversation as read
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

    private formatMessage(msg: any) {
        return {
            id: msg.id,
            conversationId: msg.conversationId,
            username: msg.author.username,
            authorId: msg.author.id,
            image: msg.author.image,
            message: msg.isDeleted ? "This message was deleted" : msg.content,
            isDeleted: msg.isDeleted,
            isRead: msg.isRead, // Include read status in response
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