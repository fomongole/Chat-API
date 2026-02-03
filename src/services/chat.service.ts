import { prisma } from '../config/prisma';

export class ChatService {
    // Find or create a 1-on-1 conversation
    async getOrCreateConversation(user1Id: string, user2Id: string) {
        // Find a conversation that has BOTH users as participants
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

    async processPrivateMessage(userId: string, conversationId: string, content: string) {
        const newMessage = await prisma.message.create({
            data: {
                content,
                authorId: userId,
                conversationId: conversationId
            },
            include: {
                author: { select: { username: true } }
            }
        });

        return {
            id: newMessage.id,
            conversationId: newMessage.conversationId,
            username: newMessage.author.username,
            message: newMessage.content,
            timestamp: newMessage.createdAt
        };
    }

    async getConversationHistory(conversationId: string, limit = 50) {
        return await prisma.message.findMany({
            where: { conversationId },
            take: limit,
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { username: true } } }
        });
    }
}

export const chatService = new ChatService();