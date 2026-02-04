import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useChatStore } from '@/store/useChatStore';
import { toast } from "sonner";
import { User } from '@/types';

/**
 * Custom Hook: useChatList
 * * Manages the state of the "Sidebar" user list.
 * * Responsibilities:
 * 1. Fetches initial list of active conversations from the backend.
 * 2. Listens for real-time updates (status changes, new messages, typing).
 * 3. Handles the "New User" scenario where a message arrives from someone not in the list.
 * 4. Maintains sorting order: Most recent activity -> Online status -> Alphabetical.
 */
export const useChatList = () => {
    const [users, setUsers] = useState<User[]>([]);
    // 'tick' is used to force a re-render every minute to update relative time (e.g. "5m ago")
    const [, setTick] = useState(0);

    const socket = useSocket();
    const setActiveUser = useChatStore((state) => state.setActiveUser);
    const selectedUser = useChatStore((state) => state.activeUser);

    const forceUpdate = useCallback(() => {
        setTick(t => t + 1);
    }, []);

    /**
     * Sorting Logic:
     * Priority 1: Recent Activity (Message Timestamp) - To mimic WhatsApp/Slack style.
     * Priority 2: Online Status - Online users float to top if timestamps are equal.
     */
    const sortUsers = (usersToSort: User[]) => {
        return [...usersToSort].sort((a, b) => {
            const timeA = new Date(a.lastActivity || 0).getTime();
            const timeB = new Date(b.lastActivity || 0).getTime();
            // Sort Descending by time
            if (timeB !== timeA) return timeB - timeA;

            // Sort by Online Status
            if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;

            return 0;
        });
    };

    /**
     * Fetches the user list from the backend.
     * Wrapped in useCallback to be safely used in the dependency array of useEffect.
     */
    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/users');
            setUsers(sortUsers(response.data.data.users));
        } catch (error) {
            console.error("Failed to load users:", error);
            toast.error("Failed to sync team list.");
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Interval to update "Last Seen" text (e.g. "5 mins ago" -> "6 mins ago")
    useEffect(() => {
        const intervalId = setInterval(forceUpdate, 60000);
        // Optimize: Only update when tab is active to save resources
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

    // UX: Clear unread count immediately when user clicks/selects a chat
    useEffect(() => {
        if (selectedUser) {
            setUsers(prev => prev.map(u =>
                u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u
            ));
        }
    }, [selectedUser]);

    // ----------------------------------------------------
    // SOCKET EVENT LISTENERS
    // ----------------------------------------------------
    useEffect(() => {
        if (!socket) return;

        // Handles online/offline status updates broadcasted by server
        const handleStatusChange = (data: { userId: string, isOnline: boolean, lastSeen: string }) => {
            setUsers(prevUsers => {
                const updated = prevUsers.map(user => {
                    if (user.id === data.userId) {
                        return {
                            ...user,
                            isOnline: data.isOnline,
                            lastSeen: data.lastSeen,
                            isTyping: data.isOnline ? user.isTyping : false // Reset typing if offline
                        };
                    }
                    return user;
                });
                return sortUsers(updated);
            });

            // If we are currently chatting with them, update the active header too
            if (selectedUser?.id === data.userId) {
                setActiveUser({ ...selectedUser, isOnline: data.isOnline, lastSeen: data.lastSeen });
            }
        };

        // Handles profile updates (image, username change)
        const handleUserUpdate = (data: any) => {
            setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, ...data } : u));
            if (selectedUser?.id === data.userId) setActiveUser({ ...selectedUser, ...data });
        };

        // UI Indicators for Typing
        const handleTyping = (data: { userId: string }) => {
            setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, isTyping: true } : u));
        };

        const handleStopTyping = (data: { userId: string }) => {
            setUsers(prev => prev.map(u => u.id === data.userId ? { ...u, isTyping: false } : u));
        };

        /**
         * CRITICAL: Handles incoming (or sent) messages for the sidebar.
         * logic:
         * 1. If user exists in list -> Update preview, timestamp, and unread count.
         * 2. If user DOES NOT exist (New Conversation) -> Fetch list from backend.
         */
        const handleNewMessageNotification = async (data: { senderId: string, message: string, isOwn?: boolean }) => {
            // Determine the target User ID to update in the list
            // If I sent it (isOwn=true), I want to update the Recipient's row.
            const targetUserId = data.senderId;

            // Check if this user is already in our list
            const userExists = users.some(u => u.id === targetUserId);

            if (userExists) {
                // OPTIMISTIC UPDATE: Update local state instantly
                setUsers(prev => {
                    const updatedList = prev.map(u => {
                        if (u.id === targetUserId) {
                            const isCurrentChat = selectedUser?.id === targetUserId;
                            // Only increment badge if it's NOT my message AND I'm not looking at the chat
                            const shouldIncrement = !data.isOwn && !isCurrentChat;

                            return {
                                ...u,
                                lastMessage: data.message,
                                lastActivity: new Date().toISOString(), // Move to top
                                unreadCount: shouldIncrement ? (u.unreadCount || 0) + 1 : (u.unreadCount || 0)
                            };
                        }
                        return u;
                    });
                    return sortUsers(updatedList);
                });
            } else {
                // FALLBACK: New Conversation detected. Fetch fresh data.
                await fetchUsers();
                if (!data.isOwn) {
                    toast.info("New conversation started");
                }
            }
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
    }, [socket, selectedUser, setActiveUser, users, fetchUsers]);

    return { users };
};