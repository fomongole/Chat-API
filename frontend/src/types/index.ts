export interface User {
    id: string;
    username: string;
    image?: string;
    about?: string;
    isOnline: boolean;
    lastSeen?: string;
    isPrivate?: boolean;
}

export interface Message {
    id?: string;
    conversationId?: string;
    recipientId?: string;
    message?: string; // Some parts of your code use 'message'
    content?: string; // Some parts might use 'content'
    username?: string;
    author?: {
        username: string;
    };
    createdAt?: string;
}