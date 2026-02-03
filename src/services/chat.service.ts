export class ChatService {
    async processMessage(userId: string, message: string) {
        console.log(`Service: Processing message from ${userId}`);

        return {
            userId,
            message,
            timestamp: new Date().toISOString()
        };
    }
}

export const chatService = new ChatService();