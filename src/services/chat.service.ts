import { prisma } from '../config/prisma';

export class ChatService {
    async processMessage(userId: string, content: string) {

        const newMessage = await prisma.message.create({
            data: {
                content: content,
                authorId: userId,
            },
            include: {
                author: {
                    select: { username: true }
                }
            }
        });

        return {
            id: newMessage.id,
            userId: newMessage.authorId,
            username: newMessage.author.username,
            message: newMessage.content,
            timestamp: newMessage.createdAt
        };
    }

    async getRecentMessages(limit = 50) {
        return await prisma.message.findMany({
            take: limit,
            orderBy: { createdAt: 'asc' },
            include: {
                author: {
                    select: { username: true }
                }
            }
        });
    }
}

export const chatService = new ChatService();