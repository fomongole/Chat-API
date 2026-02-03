import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
    id: string;
    username: string;
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(
        payload,
        env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};