import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/store/useChatStore';
import { toast } from "sonner";
import { User } from '@/types';

export const useTeamData = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [, setTick] = useState(0);

    const socket = useSocket();
    const setActiveUser = useChatStore((state) => state.setActiveUser);
    const selectedUser = useChatStore((state) => state.activeUser);

    const forceUpdate = useCallback(() => {
        setTick(t => t + 1);
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data.data.users);
            } catch (error) {
                console.error("Failed to load users:", error);
                toast.error("Failed to sync team list.");
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(forceUpdate, 60000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') forceUpdate();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", forceUpdate);
        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", forceUpdate);
        };
    }, [forceUpdate]);

    // Handle Clearing Unread Count when we select a user
    useEffect(() => {
        if (selectedUser) {
            setUsers(prev => prev.map(u =>
                u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u
            ));
        }
    }, [selectedUser]);

    useEffect(() => {
        if (!socket) return;

        const handleStatusChange = (data: { userId: string, isOnline: boolean, lastSeen: string }) => {
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.id === data.userId) {
                    return {
                        ...user,
                        isOnline: data.isOnline,
                        lastSeen: data.lastSeen,
                        isTyping: data.isOnline ? user.isTyping : false
                    };
                }
                return user;
            }));

            if (selectedUser?.id === data.userId) {
                setActiveUser({ ...selectedUser, isOnline: data.isOnline, lastSeen: data.lastSeen });
            }
        };

        const handleUserUpdate = (data: any) => {
            setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, ...data } : u));
            if (selectedUser?.id === data.userId) setActiveUser({ ...selectedUser, ...data });
        };

        const handleTyping = (data: { userId: string }) => {
            setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, isTyping: true } : u));
        };

        const handleStopTyping = (data: { userId: string }) => {
            setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, isTyping: false } : u));
        };

        // This listens for the 'new_message_notification' event from the backend
        const handleNewMessageNotification = (data: { senderId: string, message: string }) => {
            // If we are currently talking to this user, don't increment unread count
            // (The chat window handles marking it read)
            if (selectedUser?.id === data.senderId) return;

            setUsers(prev => prev.map(u => {
                if (u.id === data.senderId) {
                    return {
                        ...u,
                        unreadCount: (u.unreadCount || 0) + 1
                    };
                }
                return u;
            }));

            // TODO Show a system notification toast if on another tab/chat
        };

        socket.on("user_status_change", handleStatusChange);
        socket.on("user_update", handleUserUpdate);
        socket.on("user_typing", handleTyping);
        socket.on("user_stop_typing", handleStopTyping);
        socket.on("new_message_notification", handleNewMessageNotification);

        return () => {
            socket.off("user_status_change", handleStatusChange);
            socket.off("user_update", handleUserUpdate);
            socket.off("user_typing", handleTyping);
            socket.off("user_stop_typing", handleStopTyping);
            socket.off("new_message_notification", handleNewMessageNotification);
        };
    }, [socket, selectedUser, setActiveUser]);

    return { users };
};