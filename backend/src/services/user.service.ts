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

    async getAllUsers(currentUserId: string) {
        const users = await prisma.user.findMany({
            where: { id: { not: currentUserId } },
            select: {
                id: true,
                username: true,
                image: true,
                about: true,    // We fetch it, but we might strip it
                email: true,    // We fetch it, but we might strip it
                isOnline: true,
                lastSeen: true,
                isPrivate: true
            },
            orderBy: { isOnline: 'desc' }
        });

        // ENTERPRISE PRIVACY FILTER
        // If a user is private, we return ONLY the bare essentials needed for the chat list
        return users.map(user => {
            if (user.isPrivate) {
                return {
                    id: user.id,
                    username: user.username,
                    image: user.image,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen,
                    isPrivate: true,
                    about: null, // STRICT: No bio leaked
                    email: null  // STRICT: No email leaked
                };
            }
            return user;
        });
    }
}

export const userService = new UserService();