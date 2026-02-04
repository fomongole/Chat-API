'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Custom Hook: useSocket
 * * Manages the global Socket.io connection.
 * * Logic:
 * 1. Connects ONLY when a valid Auth Token exists.
 * 2. Uses 'websocket' transport by default for performance (skips HTTP polling).
 * 3. Handles connection/disconnection lifecycle automatically.
 */
export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (!token) return;

        // Initialize connection
        // Note: In production, URL should come from env variables
        socketRef.current = io('http://localhost:3000', {
            auth: { token },
            transports: ['websocket'], // Performance optimization
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Connected to WebSocket:', socketRef.current?.id);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('❌ Connection Error:', err.message);
        });

        // Cleanup on unmount or token change
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [token]);

    return socketRef.current;
};