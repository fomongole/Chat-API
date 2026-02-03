import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        username: z.string({ message: 'Username must be at least 2 characters' }).min(2,{ message: 'Username must be at least 2 characters' }).optional(),
        email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email format' }),
        password: z.string({ message: 'Password is required' }).min(8, { message: 'Password must be at least 8 characters' }),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string({ message: 'Email is required' }).email({ message: 'Invalid email format' }),
        password: z.string({ message: 'Password is required' }).min(1, { message: 'Password is required' }),
    }),
});