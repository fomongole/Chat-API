export interface User {
    id: string;
    username: string;
    image?: string;
    about?: string;
    isOnline: boolean;
    lastSeen?: string;
    isPrivate?: boolean;
    isTyping?: boolean; // For UI use only
    unreadCount?: number;
}

export interface Message {
    id: string;
    conversationId: string;
    authorId: string; // Crucial for "Can I delete this?" check
    username: string;
    image?: string;

    // Content
    message: string;
    content?: string; // Fallback

    // Status
    isDeleted: boolean;
    isRead: boolean;
    timestamp: string; // ISO String

    // Reply Data
    replyTo?: {
        id: string;
        username: string;
        content: string;
    } | null;
}