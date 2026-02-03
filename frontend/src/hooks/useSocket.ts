'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (!token) return;

        // Connect to the backend
        socketRef.current = io('http://localhost:3000', {
            auth: { token },
            transports: ['websocket'], // Faster, skips polling
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Connected to WebSocket:', socketRef.current?.id);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('❌ Connection Error:', err.message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [token]);

    return socketRef.current;
};