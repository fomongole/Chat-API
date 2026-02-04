import { prisma } from '../config/prisma';
import cloudinary from '../config/cloudinary';
import { AppError } from '../utils/app.error';

export class UserService {
    async updateProfile(userId: string, data: { about?: string }, file?: Express.Multer.File) {
        let imageUrl: string | undefined;

        // 1. Upload image to Cloudinary if a file is provided
        if (file) {
            // Convert buffer to base64 data URI for Cloudinary
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = "data:" + file.mimetype + ";base64," + b64;

            try {
                const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                    folder: 'chat-app-profiles',
                    resource_type: 'image'
                });
                imageUrl = uploadResponse.secure_url;
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                throw new AppError('Failed to upload image', 500);
            }
        }

        // 2. Update User in Database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.about && { about: data.about }),
                ...(imageUrl && { image: imageUrl }),
            },
            select: {
                id: true,
                username: true,
                email: true,
                image: true,
                about: true,
                isOnline: true
            }
        });

        return updatedUser;
    }
}

export const userService = new UserService();