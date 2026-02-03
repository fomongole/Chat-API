import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/app.error';
import { generateToken } from '../utils/token.util';

export class AuthService {
    private async generateUniqueUsername(baseEmail: string): Promise<string> {
        const prefix = baseEmail.split('@')[0];
        let isUnique = false;
        let finalUsername = prefix;

        while (!isUnique) {
            const existing = await prisma.user.findUnique({ where: { username: finalUsername } });
            if (!existing) {
                isUnique = true;
            } else {
                finalUsername = `${prefix}_${Math.floor(Math.random() * 10000)}`;
            }
        }
        return finalUsername;
    }

    async register(userData: any) {
        const existingEmail = await prisma.user.findUnique({ where: { email: userData.email } });
        if (existingEmail) throw new AppError('User with this email already exists', 400);

        let username = userData.username;
        if (!username) {
            username = await this.generateUniqueUsername(userData.email);
        } else {
            const existingUser = await prisma.user.findUnique({ where: { username } });
            if (existingUser) throw new AppError('Username is already taken', 400);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const user = await prisma.user.create({
            data: {
                email: userData.email,
                username: username,
                password: hashedPassword,
            }
        });

        const token = generateToken({ id: user.id, username: user.username });
        return { token };
    }

    async login(credentials: any) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });

        if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = generateToken({ id: user.id, username: user.username });
        return { token };
    }

    async getAllUsers(currentUserId: string) {
        return await prisma.user.findMany({
            where: {
                id: { not: currentUserId }
            },
            select: {
                id: true,
                username: true,
                email: true
            }
        });
    }
}

export const authService = new AuthService();