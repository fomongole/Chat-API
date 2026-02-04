import { prisma } from '../config/prisma';
import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/app.error';

export class UserService {
    async updateProfile(userId: string, data: { about?: string; isPrivate?: string }, file?: Express.Multer.File) {
        let imageUrl: string | undefined;

        // Image upload logic
        if (file) {
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = "data:" + file.mimetype + ";base64," + b64;
            try {
                const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                    folder: 'chat-app-profiles',
                    resource_type: 'image'
                });
                imageUrl = uploadResponse.secure_url;
            } catch (error) {
                throw new AppError('Failed to upload image', 500);
            }
        }

        const isPrivateBoolean = data.isPrivate === 'true';

        return prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.about && { about: data.about }),
                ...(data.isPrivate !== undefined && { isPrivate: isPrivateBoolean }),
                ...(imageUrl && { image: imageUrl }),
            },
            select: {
                id: true,
                username: true,
                email: true,
                image: true,
                about: true,
                isOnline: true,
                isPrivate: true
            }
        });
    }

    /**
     * This is a critical query for app performance.
     * * Goal: Fetch active chats, sorted by recency, with unread counts and preview text.
     * Method: Query 'Conversation' table (not User table) to limit results to actual interactions.
     * Optimization: Uses Nested Includes and _count to avoid N+1 queries loop.
     */
    async getSidebarUsers(currentUserId: string) {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { id: currentUserId } }
            },
            orderBy: { updatedAt: 'desc' }, // Critical: WhatsApp-style sorting (Recent first)
            include: {
                // 1. Get the OTHER user info (The person we are chatting with)
                participants: {
                    where: { id: { not: currentUserId } },
                    select: {
                        id: true, username: true, image: true, isOnline: true,
                        lastSeen: true, isPrivate: true, about: true, email: true
                    }
                },
                // 2. Get the Actual Last Message (For Sidebar Preview)
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                // 3. Get the Unread Count (Efficient Database-level counting)
                _count: {
                    select: {
                        messages: {
                            where: {
                                isRead: false,
                                authorId: { not: currentUserId } // Only count messages sent BY them
                            }
                        }
                    }
                }
            }
        });

        // ---------------------------------------------------------
        // Data Transformation Layer
        // ---------------------------------------------------------

        // A. If we have active chats, format them
        if (conversations.length > 0) {
            return conversations.map(conv => {
                const user = conv.participants[0]; // Extract the other participant
                const lastMsg = conv.messages[0];
                const unreadCount = conv._count.messages;

                // Format Preview: Check if "I" sent the last message
                let previewText = lastMsg?.content || null;

                if (lastMsg && lastMsg.authorId === currentUserId) {
                    previewText = `You: ${lastMsg.content}`;
                }

                if (lastMsg && lastMsg.isDeleted) {
                    previewText = "Message deleted";
                }

                const baseUser = {
                    ...user,
                    lastMessage: previewText,
                    // Use message time for sorting, fallback to conversation creation if empty
                    lastActivity: lastMsg?.createdAt || conv.updatedAt,
                    unreadCount
                };

                // Privacy Filter: If user is private, hide PII
                if (user.isPrivate) {
                    return {
                        ...baseUser,
                        about: null,
                        email: null,
                    };
                }

                return baseUser;
            });
        }

        // B. Cold Start / Fallback: If no chats exist, suggest random users
        const suggestedUsers = await prisma.user.findMany({
            where: { id: { not: currentUserId } },
            take: 10,
            select: {
                id: true, username: true, image: true, isOnline: true,
                lastSeen: true, isPrivate: true, about: true, email: true
            }
        });

        return suggestedUsers.map(user => {
            if (user.isPrivate) {
                return { ...user, about: null, email: null, unreadCount: 0 };
            }
            return { ...user, unreadCount: 0 };
        });
    }

    /**
     * Search Users Logic
     * Used when the sidebar search bar is typed into.
     */
    async searchUsers(query: string, currentUserId: string) {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: currentUserId } },
                    {
                        OR: [
                            { username: { contains: query, mode: 'insensitive' } },
                            { email: { contains: query, mode: 'insensitive' } }
                        ]
                    }
                ]
            },
            take: 20, // Performance Limit
            select: {
                id: true, username: true, image: true, isPrivate: true,
                isOnline: true, lastSeen: true, about: true
            }
        });

        // Apply Privacy Filter
        return users.map(user => {
            if (user.isPrivate) {
                return {
                    id: user.id, username: user.username, image: user.image,
                    isOnline: user.isOnline, lastSeen: user.lastSeen,
                    isPrivate: true, about: null
                };
            }
            return user;
        });
    }
}

export const userService = new UserService();