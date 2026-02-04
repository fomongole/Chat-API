import { prisma } from '../config/prisma';
import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/app.error';

export class UserService {
    async updateProfile(userId: string, data: { about?: string; isPrivate?: string }, file?: Express.Multer.File) {
        let imageUrl: string | undefined;

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

        return await prisma.user.update({
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

    // This function attaches 'unreadCount' to every user
    // This allows the frontend sidebar to show red badges instantly on load.
    async getAllUsers(currentUserId: string) {
        const users = await prisma.user.findMany({
            where: { id: { not: currentUserId } },
            select: {
                id: true,
                username: true,
                image: true,
                about: true,
                email: true,
                isOnline: true,
                lastSeen: true,
                isPrivate: true
            },
            orderBy: { isOnline: 'desc' }
        });

        // We need to fetch unread counts in parallel for performance
        const usersWithUnread = await Promise.all(users.map(async (user) => {
            // Find the conversation between ME and THIS USER
            const conversation = await prisma.conversation.findFirst({
                where: {
                    AND: [
                        { participants: { some: { id: currentUserId } } },
                        { participants: { some: { id: user.id } } }
                    ]
                },
                select: { id: true }
            });

            let unreadCount = 0;

            if (conversation) {
                // Count messages where:
                // 1. Conversation matches
                // 2. I am NOT the author (I received them)
                // 3. isRead is false
                unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conversation.id,
                        authorId: user.id,
                        isRead: false
                    }
                });
            }

            // PRIVACY FILTER
            if (user.isPrivate) {
                return {
                    id: user.id,
                    username: user.username,
                    image: user.image,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen,
                    isPrivate: true,
                    about: null,
                    email: null,
                    unreadCount // We still show unread count internally, this is private to ME
                };
            }

            return { ...user, unreadCount };
        }));

        return usersWithUnread;
    }
}

export const userService = new UserService();